"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin";

export interface RestrictState {
  error?: string;
}

// GoTrue's ban_duration wants a decimal-number-plus-unit string, not a date —
// ~100 years reads as "indefinite" without a magic "forever" sentinel value.
const BAN_INDEFINITE = "876000h";
const BAN_LIFT = "none";

/**
 * Suspend any non-admin account: patient, provider, or institution. Blocks
 * it at two independent layers — profiles.restricted (checked by
 * getCurrentProfile/signInAction on every request) and Supabase's own
 * ban_duration (blocks new logins/refreshes at the Auth layer itself, even
 * if our own check were ever bypassed).
 */
export async function restrictAccount(
  _prev: RestrictState,
  formData: FormData,
): Promise<RestrictState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { error: "You don't have permission to do that." };
  }

  const targetUserId = String(formData.get("userId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!targetUserId) return { error: "Missing account." };
  if (reason.length < 5) return { error: "Add a brief reason (at least 5 characters)." };

  const db = createAdminClient();

  const { data: target } = await db
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) return { error: "That account could not be found." };
  if (target.role === "admin") return { error: "Admin accounts can't be restricted here." };

  const { error } = await db
    .from("profiles")
    .update({ restricted: true })
    .eq("id", targetUserId);
  if (error) return { error: "Couldn't restrict that account. Try again." };

  try {
    await db.auth.admin.updateUserById(targetUserId, { ban_duration: BAN_INDEFINITE });
  } catch {
    // profiles.restricted still blocks them at the app layer even if this fails.
  }

  await logAdminAction({
    adminId: admin.id,
    actionType: "account_restrict",
    patientId: null,
    reason,
    metadata: { target_user_id: targetUserId, target_role: target.role },
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/records");
  return {};
}

/** Lifts a restriction — reverses both layers restrictAccount set. */
export async function restoreAccount(
  _prev: RestrictState,
  formData: FormData,
): Promise<RestrictState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { error: "You don't have permission to do that." };
  }

  const targetUserId = String(formData.get("userId") ?? "");
  if (!targetUserId) return { error: "Missing account." };

  const db = createAdminClient();

  const { data: target } = await db
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) return { error: "That account could not be found." };

  const { error } = await db
    .from("profiles")
    .update({ restricted: false })
    .eq("id", targetUserId);
  if (error) return { error: "Couldn't restore that account. Try again." };

  try {
    await db.auth.admin.updateUserById(targetUserId, { ban_duration: BAN_LIFT });
  } catch {
    // Non-fatal — profiles.restricted is the source of truth for our own checks.
  }

  await logAdminAction({
    adminId: admin.id,
    actionType: "account_unrestrict",
    patientId: null,
    metadata: { target_user_id: targetUserId, target_role: target.role },
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/records");
  return {};
}
