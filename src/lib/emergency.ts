import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptField } from "@/lib/crypto";

/**
 * The privileged emergency read path (BUILD_SPEC §7). This is the ONE place
 * that crosses the row owner boundary, decrypts the sensitive fields, and
 * writes the audit log — all via the secret key.
 *
 * Caller (route/page) is responsible for authenticating the provider and
 * confirming role=provider + provider_status=approved BEFORE calling
 * `readEmergencyProfile`.
 */

/** The minimal emergency view — never includes email, hashes, or metadata. */
export interface EmergencyView {
  patient_name: string | null;
  blood_group: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  accessed_at: string;
}

/** Does this token map to a record? Same answer shape for every unknown token. */
export async function tokenExists(token: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("medical_profiles")
    .select("id")
    .eq("qr_token", token)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Look up by token, decrypt in memory, write an access_logs row, and return
 * the minimal view. Returns null if the token is unknown (caller renders 404).
 */
export async function readEmergencyProfile(
  token: string,
  accessorId: string,
): Promise<EmergencyView | null> {
  const admin = createAdminClient();

  const { data: mp } = await admin
    .from("medical_profiles")
    .select(
      "id, user_id, blood_group, allergies, medications, medical_conditions, emergency_contact_name, emergency_contact_phone",
    )
    .eq("qr_token", token)
    .maybeSingle();

  if (!mp) return null;

  // Audit the access before returning anything (BUILD_SPEC §7.6).
  await admin.from("access_logs").insert({
    accessor_id: accessorId,
    patient_id: mp.id,
    access_type: "emergency_view",
  });

  const { data: prof } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", mp.user_id)
    .maybeSingle();

  const [allergies, medications, medical_conditions] = await Promise.all([
    decryptField(mp.allergies),
    decryptField(mp.medications),
    decryptField(mp.medical_conditions),
  ]);

  return {
    patient_name: prof?.full_name ?? null,
    blood_group: mp.blood_group,
    allergies,
    medications,
    medical_conditions,
    emergency_contact_name: mp.emergency_contact_name,
    emergency_contact_phone: mp.emergency_contact_phone,
    accessed_at: new Date().toISOString(),
  };
}
