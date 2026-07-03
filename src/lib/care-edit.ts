import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptField } from "@/lib/crypto";
import { sendAccessNotification } from "@/lib/notify";
import type { MedicalProfileRow } from "@/lib/database.types";

/**
 * A doctor's write path to a patient's clinical fields — deliberately
 * separate from the read path in emergency.ts. Any approved provider can
 * write here (no patient-side approval required); every write is still
 * logged and the patient is still notified, so it stays visible even though
 * it's no longer gated.
 *
 * Scope is intentionally narrow: only the encrypted clinical free-text fields
 * (allergies, medications, medical_conditions, additional_notes). Identity
 * and contact fields (blood group, DOB, emergency contacts, national ID,
 * hospital) stay patient-only-editable.
 */

export interface ClinicalEdit {
  allergies?: string;
  medications?: string;
  medical_conditions?: string;
  additional_notes?: string;
}

const CLINICAL_FIELD_LABELS: Record<keyof ClinicalEdit, string> = {
  allergies: "allergies",
  medications: "medications",
  medical_conditions: "medical conditions",
  additional_notes: "notes",
};

export interface EditAccessor {
  id: string;
  name: string | null;
  email: string | null;
}

export type EditResult = "ok" | "forbidden" | "not_found";

export async function applyClinicalEdit(
  patientUserId: string,
  edit: ClinicalEdit,
  accessor: EditAccessor,
): Promise<EditResult> {
  const admin = createAdminClient();

  const { data: mp } = await admin
    .from("medical_profiles")
    .select("id")
    .eq("user_id", patientUserId)
    .maybeSingle();
  if (!mp) return "not_found";

  const updates: Partial<
    Pick<
      MedicalProfileRow,
      "allergies" | "medications" | "medical_conditions" | "additional_notes" | "updated_at"
    >
  > = {};
  const changedLabels: string[] = [];
  for (const key of Object.keys(CLINICAL_FIELD_LABELS) as (keyof ClinicalEdit)[]) {
    const value = edit[key];
    if (value === undefined) continue;
    updates[key] = await encryptField(value);
    changedLabels.push(CLINICAL_FIELD_LABELS[key]);
  }
  if (changedLabels.length === 0) return "ok";
  updates.updated_at = new Date().toISOString();

  const { error } = await admin
    .from("medical_profiles")
    .update(updates)
    .eq("id", mp.id);
  if (error) return "forbidden";

  await admin.from("access_logs").insert({
    accessor_id: accessor.id,
    patient_id: mp.id,
    access_type: "record_edit",
    accessor_name: accessor.name,
    accessor_email: accessor.email,
    note: `Updated ${changedLabels.join(", ")}`,
  });

  // Notify the patient by email too — an edit is more consequential than a
  // read, so it gets at least the same visibility. Fire-and-forget.
  const { data: authUser } = await admin.auth.admin.getUserById(patientUserId);
  const to = authUser.user?.email;
  if (to) {
    sendAccessNotification({
      to,
      providerName: accessor.name || accessor.email || "A verified doctor",
      accessedAt: new Date(),
    }).catch(() => {});
  }

  return "ok";
}
