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

/** Plain-language sex options (BUILD_SPEC §10.2). */
export const SEX_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "intersex", label: "Intersex" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "unknown", label: "Unknown" },
] as const;

export const SEX_VALUES = SEX_OPTIONS.map((o) => o.value) as [
  "female",
  "male",
  "intersex",
  "prefer_not_to_say",
  "unknown",
];

export const ORGAN_DONOR_OPTIONS = [
  { value: "unknown", label: "Not specified" },
  { value: "yes", label: "Yes, I'm a donor" },
  { value: "no", label: "No" },
] as const;

const optionalText = z
  .string()
  .trim()
  .max(2000, "Please keep this under 2000 characters")
  .optional()
  .or(z.literal(""));

const optionalName = z
  .string()
  .trim()
  .max(120, "Please keep this under 120 characters")
  .optional()
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .max(40, "Please keep the phone number under 40 characters")
  .regex(/^[+()\-\s\d]*$/, "Use only digits, spaces, and + ( ) -")
  .optional()
  .or(z.literal(""));

/** Medical profile form (the main patient form). Plain-language fields. */
export const medicalProfileSchema = z.object({
  // About you
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .optional()
    .or(z.literal("")),
  sex: z.enum(SEX_VALUES).optional().or(z.literal("")),
  blood_group: z.enum(BLOOD_GROUPS),
  organ_donor: z.enum(["yes", "no", "unknown"]).optional().or(z.literal("")),
  // Clinical (encrypted free-text)
  allergies: optionalText,
  medications: optionalText,
  medical_conditions: optionalText,
  additional_notes: optionalText,
  // Emergency contacts
  emergency_contact_name: optionalName,
  emergency_contact_phone: optionalPhone,
  emergency_contact_relationship: optionalName,
  emergency_contact_2_name: optionalName,
  emergency_contact_2_phone: optionalPhone,
  emergency_contact_2_relationship: optionalName,
  // Primary doctor
  primary_physician_name: optionalName,
  primary_physician_phone: optionalPhone,
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
