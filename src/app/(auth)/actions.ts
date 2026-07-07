"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { credentialsSchema, signupSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin-guard";
import { recognizeDevice } from "@/lib/device";
import { sendNewDeviceAlert } from "@/lib/notify";
import type { AuthEventType } from "@/lib/database.types";

/**
 * Signup/login audit entry. Awaited (not fire-and-forget) so the write
 * completes before the caller's subsequent redirect() throws and the request
 * winds down — but a logging failure never blocks or errors the actual auth
 * flow. Written via the admin client — auth_events has no client INSERT/
 * UPDATE/DELETE policy, only a "read your own rows" SELECT policy (for
 * /security), matching access_logs' own pattern.
 */
async function logAuthEvent(
  userId: string,
  eventType: AuthEventType,
  email: string,
  newDevice = false,
  deviceId: string | null = null,
): Promise<void> {
  try {
    await createAdminClient()
      .from("auth_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        email,
        new_device: newDevice,
        device_id: deviceId,
      });
  } catch {
    // Never let a logging failure break signup/login.
  }
}

export interface AuthState {
  error?: string;
  /** Set by requestPasswordReset — always true so we never reveal if the email exists. */
  sent?: boolean;
}

/** Sign up a patient, provider, or institution. Role comes from a hidden field. */
export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawRole = formData.get("role");
  const role =
    rawRole === "provider"
      ? "provider"
      : rawRole === "institution"
        ? "institution"
        : "patient";

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  // Providers (doctors or nurses) capture a practitioner type + license number
  // at signup; it's carried in metadata so the /provider/verify page can
  // prefill it (the document upload happens there).
  const licenseNumber =
    role === "provider" ? String(formData.get("license_number") ?? "").trim() : "";
  const practitionerType =
    role === "provider"
      ? formData.get("practitioner_type") === "nurse"
        ? "nurse"
        : "doctor"
      : "";

  // Institutions capture the facility's name at signup; it's carried in metadata
  // so the /institution/verify page can prefill it (the document upload + registry
  // identifiers happen there).
  const institutionName =
    role === "institution"
      ? String(formData.get("institution_name") ?? "").trim()
      : "";

  // Facility affiliation is compulsory for providers, captured right here
  // instead of a separate step after signup. Validated before the account is
  // even created — the <select required> only guards the honest path.
  const institutionId =
    role === "provider" ? String(formData.get("institution_id") ?? "").trim() : "";
  if (role === "provider" && !institutionId) {
    return { error: "Choose your facility to continue." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        role,
        full_name: parsed.data.full_name,
        ...(role === "provider"
          ? { license_number: licenseNumber, practitioner_type: practitionerType }
          : {}),
        ...(role === "institution" ? { institution_name: institutionName } : {}),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Admin activity isn't tracked here — only regular accounts.
  if (data.user && !(await isAdmin())) {
    // Registers this browser as the account's first known device. Every
    // signup is "new" by definition (nothing to compare against yet), so
    // this is never flagged or emailed — only later logins act on it.
    const { deviceId } = await recognizeDevice(data.user.id);
    await logAuthEvent(data.user.id, "signup", parsed.data.email, false, deviceId);
  }

  // Compulsory facility affiliation, captured at signup instead of a later
  // trip to /provider/institution. Same pending-request shape as that page's
  // own form — the institution still has to approve it. Best-effort: a
  // signup must never fail because this side request did (the doctor can
  // still request affiliation again later from /provider/institution).
  if (role === "provider" && data.user && data.session) {
    try {
      await supabase.from("institution_members").insert({
        institution_id: institutionId,
        member_id: data.user.id,
        status: "pending",
      });
    } catch {
      // Non-fatal.
    }
  }

  // Provider self-registration: if signup already granted a session (email
  // confirmation off), skip the interstitial and go straight to submitting a
  // license. Otherwise land on /provider/pending, which explains they must
  // confirm their email first before they can submit anything.
  if (role === "provider") {
    redirect(data.session ? "/provider/verify" : "/provider/pending");
  }

  // Institution self-registration: same logic, straight to the registration
  // form when already signed in.
  if (role === "institution") {
    redirect(data.session ? "/institution/verify" : "/institution/pending");
  }

  // If email confirmation is on, there's no session yet.
  if (!data.session) {
    redirect("/login?check_email=1");
  }

  redirect("/dashboard");
}

/** Sign in. Routes by role and honours a `next` target (e.g. an /e/<token>). */
export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await checkRateLimit(`login:${formData.get("email") ?? "unknown"}`, 5);

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password" };
  }

  const next = (formData.get("next") as string) || "";

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message — don't reveal whether the email exists.
    return { error: "That email or password didn't match. Please try again." };
  }

  // Restricted accounts are refused even with a correct password. Supabase's
  // own ban_duration (set by restrictAccount) already blocks this at the Auth
  // layer in most cases — this is the app-level backstop.
  const { data: restriction } = await supabase
    .from("profiles")
    .select("restricted")
    .eq("id", signInData.user.id)
    .maybeSingle();
  if (restriction?.restricted) {
    await supabase.auth.signOut();
    return { error: "Your account has been restricted. Contact an administrator." };
  }

  // Admin activity isn't tracked here — only regular accounts.
  if (signInData.user && !(await isAdmin())) {
    const { isNewDevice, deviceId } = await recognizeDevice(signInData.user.id);
    await logAuthEvent(signInData.user.id, "login", parsed.data.email, isNewDevice, deviceId);
    if (isNewDevice) {
      await sendNewDeviceAlert({ to: parsed.data.email, when: new Date() });
    }
  }

  if (next.startsWith("/")) {
    redirect(next);
  }

  const user = signInData.user;

  // Admins (allowlist) land on the admin dashboard.
  if (await isAdmin()) redirect("/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  if (profile?.role === "provider") redirect("/provider");
  if (profile?.role === "institution") redirect("/institution");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Send a password-reset email. Always reports success (no email enumeration). */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await checkRateLimit(`reset:${formData.get("email") ?? "unknown"}`, 5);

  const parsed = z.email().safeParse(formData.get("email"));
  if (parsed.success) {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  }
  return { sent: true };
}

/** Set a new password using the recovery session established by the email link. */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "We couldn't update your password. Please try again." };
  }

  redirect("/dashboard");
}
