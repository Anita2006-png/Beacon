"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface RejectDeviceState {
  error?: string;
  ok?: boolean;
}

/**
 * "This wasn't me" — the account owner disowns a device from their own
 * recent sign-ins. Forgets the device (so it's flagged as new again if it
 * ever logs in again) and signs out every OTHER active session for the
 * account, keeping the one they're using right now to click this.
 */
export async function rejectDevice(
  _prev: RejectDeviceState,
  formData: FormData,
): Promise<RejectDeviceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again to continue." };

  const deviceRowId = String(formData.get("deviceRowId") ?? "");
  if (!deviceRowId) return { error: "Missing device." };

  // known_devices_select_own (RLS) makes this both the lookup and the
  // ownership check in one — a row for someone else's device simply isn't
  // visible here, so it comes back null instead of someone else's data.
  const { data: device } = await supabase
    .from("known_devices")
    .select("id")
    .eq("id", deviceRowId)
    .maybeSingle();
  if (!device) return { error: "That device could not be found." };

  const admin = createAdminClient();
  await admin.from("known_devices").delete().eq("id", deviceRowId);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    try {
      await admin.auth.admin.signOut(session.access_token, "others");
    } catch {
      // The device is still forgotten even if the sign-out call fails.
    }
  }

  revalidatePath("/security");
  return { ok: true };
}
