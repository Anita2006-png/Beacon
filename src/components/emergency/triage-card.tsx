import {
  Droplet,
  HeartPulse,
  Phone,
  Pill,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import type { EmergencyView } from "@/lib/emergency";

function rise(index: number): React.CSSProperties {
  // Staggered ≤... entrance; disabled under prefers-reduced-motion (globals).
  return { animationDelay: `${index * 70}ms` };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TriageCard({ data }: { data: EmergencyView }) {
  const hasAllergies = data.allergies.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="surface-lift bg-guilloche overflow-hidden">
        {/* Official header band */}
        <header
          className="beacon-rise flex items-center justify-between bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-4 text-primary-foreground"
          style={rise(0)}
        >
          <span className="flex items-center gap-2">
            <HeartPulse className="size-5" strokeWidth={2.4} />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">
              Emergency Medical ID
            </span>
          </span>
          <span className="font-mono text-xs opacity-80">BEACON</span>
        </header>

        <div className="p-5 sm:p-6">
          {data.patient_name && (
            <div className="beacon-rise mb-5" style={rise(1)}>
              <span className="data-label">Patient</span>
              <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {data.patient_name}
              </p>
            </div>
          )}

          {/* 1 — ALLERGIES: the loudest element when present. */}
          <section
            className={`beacon-rise rounded-2xl border-2 p-5 ${
              hasAllergies
                ? "border-critical bg-critical/10"
                : "border-border bg-muted/40"
            }`}
            style={rise(2)}
          >
            <div className="flex items-center gap-2">
              <TriangleAlert
                className={`size-6 ${hasAllergies ? "text-critical" : "text-muted-foreground"}`}
                strokeWidth={2.4}
              />
              <span
                className={`text-base font-bold uppercase tracking-[0.14em] ${
                  hasAllergies ? "text-critical" : "text-muted-foreground"
                }`}
              >
                Allergies
              </span>
            </div>
            {hasAllergies ? (
              <p className="font-display mt-2 whitespace-pre-wrap text-3xl font-bold leading-tight text-foreground">
                {data.allergies}
              </p>
            ) : (
              <p className="mt-2 text-lg text-muted-foreground">
                No known allergies on file
              </p>
            )}
          </section>

          {/* 2 — BLOOD GROUP */}
          <section
            className="beacon-rise mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-5"
            style={rise(3)}
          >
            <div className="flex items-center gap-2">
              <Droplet className="size-5 text-critical" strokeWidth={2.2} />
              <span className="data-label">Blood group</span>
            </div>
            <p className="data-value text-5xl font-bold leading-none text-foreground">
              {data.blood_group === "unknown" ? "—" : data.blood_group}
            </p>
          </section>

          {/* 3 & 4 — MEDICATIONS / CONDITIONS */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Block
              index={4}
              icon={<Pill className="size-5 text-caution" strokeWidth={2.2} />}
              label="Current medications"
              value={data.medications}
              empty="None on file"
            />
            <Block
              index={5}
              icon={
                <Stethoscope className="size-5 text-info" strokeWidth={2.2} />
              }
              label="Medical conditions"
              value={data.medical_conditions}
              empty="None on file"
            />
          </div>

          {/* 5 — EMERGENCY CONTACT */}
          <section
            className="beacon-rise mt-4 rounded-2xl border border-border bg-card p-5"
            style={rise(6)}
          >
            <div className="flex items-center gap-2">
              <Phone className="size-5 text-primary" strokeWidth={2.2} />
              <span className="data-label">Emergency contact</span>
            </div>
            {data.emergency_contact_name || data.emergency_contact_phone ? (
              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2">
                {data.emergency_contact_name && (
                  <p className="text-lg font-medium text-foreground">
                    {data.emergency_contact_name}
                  </p>
                )}
                {data.emergency_contact_phone && (
                  <a
                    href={`tel:${data.emergency_contact_phone}`}
                    className="data-value text-xl text-primary underline-offset-2 hover:underline"
                  >
                    {data.emergency_contact_phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-muted-foreground">None on file</p>
            )}
          </section>
        </div>

        {/* Audit footer */}
        <footer
          className="beacon-rise rule-dotted flex items-center gap-1.5 px-6 py-4 text-xs text-muted-foreground"
          style={rise(7)}
        >
          <ShieldCheck className="size-3.5 shrink-0" />
          <span>
            Emergency view · accessed{" "}
            <span className="data-value">{formatTime(data.accessed_at)}</span> ·
            this access has been logged.
          </span>
        </footer>
      </div>
    </div>
  );
}

function Block({
  index,
  icon,
  label,
  value,
  empty,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  empty: string;
}) {
  const has = value.trim().length > 0;
  return (
    <section
      className="beacon-rise rounded-2xl border border-border bg-card p-5"
      style={rise(index)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="data-label">{label}</span>
      </div>
      <p
        className={`mt-1.5 whitespace-pre-wrap ${
          has ? "text-lg text-foreground" : "text-muted-foreground"
        }`}
      >
        {has ? value : empty}
      </p>
    </section>
  );
}
