"use client";

import { useState } from "react";
import {
  Droplet,
  HeartHandshake,
  Phone,
  Pill,
  Stethoscope,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { DecryptedMedicalProfile } from "@/lib/medical";
import { cn } from "@/lib/utils";

const TABS = [
  "Overview",
  "Medications",
  "Allergies",
  "Conditions",
  "Contacts",
] as const;
type Tab = (typeof TABS)[number];

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="data-label">{label}</span>
      <p className="mt-0.5 text-foreground">{value || "—"}</p>
    </div>
  );
}

function CardShell({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="data-label">{title}</span>
      </div>
      {children}
    </section>
  );
}

export function PassportTabs({
  profile,
}: {
  profile: DecryptedMedicalProfile;
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const show = (t: Tab) => tab === "Overview" || tab === t;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Passport sections"
        className="inline-flex w-fit flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {show("Overview") && (
          <>
            <CardShell
              icon={<UserRound className="size-4 text-primary" />}
              title="Personal information"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of birth" value={profile.date_of_birth} />
                <Field label="Sex" value={profile.sex} />
              </div>
            </CardShell>

            <CardShell
              icon={<Droplet className="size-4 text-critical" />}
              title="Blood group"
            >
              <p className="data-value text-4xl font-bold text-foreground">
                {profile.blood_group === "unknown" ? "—" : profile.blood_group}
              </p>
            </CardShell>
          </>
        )}

        {show("Allergies") && (
          <CardShell
            icon={<TriangleAlert className="size-4 text-critical" />}
            title="Allergies"
          >
            <p className="whitespace-pre-wrap text-foreground">
              {profile.allergies || "None on file"}
            </p>
          </CardShell>
        )}

        {show("Medications") && (
          <CardShell
            icon={<Pill className="size-4 text-caution" />}
            title="Current medications"
          >
            <p className="whitespace-pre-wrap text-foreground">
              {profile.medications || "None on file"}
            </p>
          </CardShell>
        )}

        {show("Conditions") && (
          <CardShell
            icon={<Stethoscope className="size-4 text-info" />}
            title="Medical conditions"
          >
            <p className="whitespace-pre-wrap text-foreground">
              {profile.medical_conditions || "None on file"}
            </p>
          </CardShell>
        )}

        {show("Contacts") && (
          <CardShell
            icon={<Phone className="size-4 text-primary" />}
            title="Emergency contact"
          >
            <Field label="Name" value={profile.emergency_contact_name} />
            <div className="mt-2">
              <Field label="Phone" value={profile.emergency_contact_phone} />
            </div>
          </CardShell>
        )}

        {show("Overview") && (profile.primary_physician_name || profile.current_hospital_name) && (
          <CardShell
            icon={<HeartHandshake className="size-4 text-primary" />}
            title="Doctor & hospital"
          >
            <Field label="Hospital" value={profile.current_hospital_name} />
            <div className="mt-2">
              <Field label="Doctor" value={profile.primary_physician_name} />
            </div>
          </CardShell>
        )}
      </div>
    </div>
  );
}
