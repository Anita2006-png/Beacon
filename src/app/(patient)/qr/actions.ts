"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RegenerateState {
  error?: string;
  ok?: boolean;
}

/**
 * Regenerate the patient's QR token (BUILD_SPEC §7). Overwriting the token
 * instantly kills the old QR — any previously printed code stops working.
 */
export async function regenerateQrToken(): Promise<RegenerateState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { error } = await supabase
    .from("medical_profiles")
    .update({ qr_token: crypto.randomUUID(), updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { error: "We couldn't regenerate your code. Try again." };

  revalidatePath("/qr");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Patient kill switch: pause or resume all emergency access (BUILD_SPEC §7). */
export async function setEmergencyAccess(
  enabled: boolean,
): Promise<RegenerateState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { error } = await supabase
    .from("medical_profiles")
    .update({
      emergency_access_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: "We couldn't update that. Please try again." };

  revalidatePath("/qr");
  revalidatePath("/dashboard");
  return { ok: true };
}
