"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ApproveState {
  error?: string;
}

/** Approve a pending provider (BUILD_SPEC §6). Admin-only; uses the secret key. */
export async function approveProvider(
  _prev: ApproveState,
  formData: FormData,
): Promise<ApproveState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "You don't have permission to do that." };
  }

  const providerId = formData.get("provider_id");
  if (typeof providerId !== "string" || !providerId) {
    return { error: "Missing provider." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ provider_status: "approved" })
    .eq("id", providerId)
    .eq("role", "provider");

  if (error) return { error: "Couldn't approve that provider. Try again." };

  revalidatePath("/admin");
  return {};
}
