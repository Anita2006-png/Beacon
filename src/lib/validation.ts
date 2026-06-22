import { z } from "zod";

/** Blood groups accepted by the DB CHECK constraint (BUILD_SPEC §4). */
export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

const optionalText = z
  .string()
  .trim()
  .max(2000, "Please keep this under 2000 characters")
  .optional()
  .or(z.literal(""));

/** Medical profile form (the main patient form). Plain-language fields. */
export const medicalProfileSchema = z.object({
  blood_group: z.enum(BLOOD_GROUPS),
  allergies: optionalText,
  medications: optionalText,
  medical_conditions: optionalText,
  emergency_contact_name: z
    .string()
    .trim()
    .max(120, "Please keep the name under 120 characters")
    .optional()
    .or(z.literal("")),
  emergency_contact_phone: z
    .string()
    .trim()
    .max(40, "Please keep the phone number under 40 characters")
    .regex(/^[+()\-\s\d]*$/, "Use only digits, spaces, and + ( ) -")
    .optional()
    .or(z.literal("")),
});

export type MedicalProfileInput = z.infer<typeof medicalProfileSchema>;

/** Auth schemas. */
export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const signupSchema = credentialsSchema.extend({
  full_name: z.string().trim().min(1, "Tell us your name").max(120),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
