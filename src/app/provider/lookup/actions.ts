"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile, isApprovedProvider } from "@/lib/auth";
import {
  lookupByEmail,
  lookupByNationalId,
  type EmergencyResult,
  type EmergencyView,
} from "@/lib/emergency";
import { clinicalEditSchema, nationalIdSchema } from "@/lib/validation";
import { applyClinicalEdit } from "@/lib/care-edit";

export type LookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; view: EmergencyView; patient_user_id: string }
  | { status: "disabled" }
  | { status: "not_found" };

/**
 * Backup patient lookup (BUILD_SPEC Phase 2), by national ID or account
 * email — for when a patient can't present their Beacon QR code. Either path
 * goes through the same privileged read, and logs + notifies the patient the
 * same way. Authorisation is re-checked here — never trust the client.
 */
export async function lookupPatient(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const session = await getCurrentProfile();
  if (!session || !isApprovedProvider(session.profile)) {
    return {
      status: "error",
      message: "Only approved providers can look up records.",
    };
  }

  const accessor = {
    id: session.user.id,
    name: session.profile.full_name,
    email: session.user.email ?? null,
  };

  const mode = formData.get("mode") === "email" ? "email" : "national_id";

  let lookup: EmergencyResult;
  if (mode === "email") {
    const parsed = z.email().safeParse(formData.get("query"));
    if (!parsed.success) {
      return { status: "error", message: "Enter a valid email address" };
    }
    lookup = await lookupByEmail(parsed.data, accessor);
  } else {
    const parsed = nationalIdSchema.safeParse(formData.get("query"));
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Enter a valid national ID",
      };
    }
    lookup = await lookupByNationalId(parsed.data, accessor);
  }

  if (lookup.status !== "ok") return { status: lookup.status };

  return {
    status: "ok",
    view: lookup.view,
    patient_user_id: lookup.patient_user_id,
  };
}

export interface ClinicalEditState {
  error?: string;
  ok?: boolean;
}

/**
 * A doctor saves an edit to a patient's clinical fields — only the four
 * encrypted free-text fields. Any approved provider can do this; the edit is
 * still logged and the patient still notified (applyClinicalEdit), it's just
 * not gated behind a patient-approved request anymore.
 */
export async function submitClinicalEdit(
  _prev: ClinicalEditState,
  formData: FormData,
): Promise<ClinicalEditState> {
  const session = await getCurrentProfile();
  if (!session || !isApprovedProvider(session.profile)) {
    return { error: "Only approved providers can edit records." };
  }

  const patientUserId = formData.get("patient_user_id");
  if (typeof patientUserId !== "string" || !patientUserId) {
    return { error: "Missing patient." };
  }

  const parsed = clinicalEditSchema.safeParse({
    allergies: formData.get("allergies"),
    medications: formData.get("medications"),
    medical_conditions: formData.get("medical_conditions"),
    additional_notes: formData.get("additional_notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const result = await applyClinicalEdit(patientUserId, parsed.data, {
    id: session.user.id,
    name: session.profile.full_name,
    email: session.user.email ?? null,
  });

  if (result === "not_found") {
    return { error: "That patient's record couldn't be found." };
  }
  if (result === "forbidden") {
    return { error: "We couldn't save that. Please try again." };
  }

  revalidatePath("/provider/lookup");
  return { ok: true };
}
