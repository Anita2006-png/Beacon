"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PRACTITIONER_TYPE_VALUES } from "@/lib/validation";

export interface RosterActionState {
  error?: string;
  ok?: boolean;
}

/**
 * Add an expected staff member to the institution's own roster. RLS
 * (isr_all_own_institution) already restricts this to rows whose
 * institution_id belongs to the signed-in institution — the query below is
 * just how we find that institution's own id.
 */
export async function addRosterEntry(
  _prev: RosterActionState,
  formData: FormData,
): Promise<RosterActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again to continue." };

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, status")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!institution) return { error: "Your facility isn't registered yet." };
  if (institution.status !== "verified") {
    return { error: "Your facility must be verified first." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const licenseNumber = String(formData.get("license_number") ?? "").trim();
  const practitionerType = formData.get("practitioner_type") === "nurse" ? "nurse" : "doctor";

  if (!fullName || fullName.length > 120) {
    return { error: "Enter the staff member's name." };
  }
  if (!licenseNumber || !/^[A-Za-z0-9-]{4,32}$/.test(licenseNumber)) {
    return { error: "Enter a valid council license number." };
  }
  if (!(PRACTITIONER_TYPE_VALUES as readonly string[]).includes(practitionerType)) {
    return { error: "Choose a valid practitioner type." };
  }

  const { error } = await supabase.from("institution_staff_roster").insert({
    institution_id: institution.id,
    full_name: fullName,
    license_number: licenseNumber,
    practitioner_type: practitionerType,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That license number is already on your roster." };
    }
    return { error: "We couldn't add that entry. Please try again." };
  }

  revalidatePath("/institution/roster");
  return { ok: true };
}

export async function removeRosterEntry(
  _prev: RosterActionState,
  formData: FormData,
): Promise<RosterActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again to continue." };

  const entryId = formData.get("entry_id");
  if (typeof entryId !== "string" || !entryId) {
    return { error: "Missing entry." };
  }

  const { error } = await supabase
    .from("institution_staff_roster")
    .delete()
    .eq("id", entryId);

  if (error) return { error: "We couldn't remove that entry. Please try again." };

  revalidatePath("/institution/roster");
  return { ok: true };
}
