"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, signupSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export interface AuthState {
  error?: string;
}

/** Sign up a patient or provider. Role comes from a hidden form field. */
export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const role = formData.get("role") === "provider" ? "provider" : "patient";

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { role, full_name: parsed.data.full_name } },
  });

  if (error) {
    return { error: error.message };
  }

  // Provider self-registration always lands in the pending state.
  if (role === "provider") {
    redirect("/provider/pending");
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
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message — don't reveal whether the email exists.
    return { error: "That email or password didn't match. Please try again." };
  }

  if (next.startsWith("/")) {
    redirect(next);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  redirect(profile?.role === "provider" ? "/provider" : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
