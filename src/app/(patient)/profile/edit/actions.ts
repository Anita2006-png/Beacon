"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { encryptField } from "@/lib/crypto";
import { medicalProfileSchema } from "@/lib/validation";

export interface SaveState {
  error?: string;
}

/**
 * Save the patient's medical profile (BUILD_SPEC §3, §8).
 *
 * The three sensitive fields are encrypted HERE, server-side, with the secret
 * AES key — the key never reaches the client. The write itself goes through the
 * user's RLS session, so ownership is still enforced at the data tier.
 */
export async function saveMedicalProfile(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  const parsed = medicalProfileSchema.safeParse({
    blood_group: formData.get("blood_group"),
    allergies: formData.get("allergies"),
    medications: formData.get("medications"),
    medical_conditions: formData.get("medical_conditions"),
    emergency_contact_name: formData.get("emergency_contact_name"),
    emergency_contact_phone: formData.get("emergency_contact_phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }
  const v = parsed.data;

  const [allergies, medications, medical_conditions] = await Promise.all([
    encryptField(v.allergies),
    encryptField(v.medications),
    encryptField(v.medical_conditions),
  ]);

  const { error } = await supabase.from("medical_profiles").upsert(
    {
      user_id: user.id,
      blood_group: v.blood_group,
      allergies,
      medications,
      medical_conditions,
      emergency_contact_name: v.emergency_contact_name || null,
      emergency_contact_phone: v.emergency_contact_phone || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: "We couldn't save your profile. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/qr");
  redirect("/dashboard?saved=1");
}
