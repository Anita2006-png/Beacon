import {
  Droplet,
  Phone,
  Pill,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import type { EmergencyView } from "@/lib/emergency";

function rise(index: number): React.CSSProperties {
  // Staggered ≤200ms entrance; disabled under prefers-reduced-motion (globals).
  return { animationDelay: `${index * 60}ms` };
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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header className="beacon-rise" style={rise(0)}>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Emergency medical information
        </p>
        {data.patient_name && (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {data.patient_name}
          </h1>
        )}
      </header>

      {/* 1 — ALLERGIES: the loudest block on the page when present. */}
      <section
        className={`beacon-rise rounded-[var(--radius)] border-2 p-5 ${
          hasAllergies
            ? "border-critical bg-critical/10"
            : "border-border bg-card"
        }`}
        style={rise(1)}
      >
        <div className="flex items-center gap-2">
          <TriangleAlert
            className={`size-6 ${hasAllergies ? "text-critical" : "text-muted-foreground"}`}
          />
          <h2
            className={`text-lg font-bold uppercase tracking-wide ${
              hasAllergies ? "text-critical" : "text-muted-foreground"
            }`}
          >
            Allergies
          </h2>
        </div>
        {hasAllergies ? (
          <p className="mt-2 whitespace-pre-wrap text-2xl font-semibold leading-snug text-foreground">
            {data.allergies}
          </p>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">
            No known allergies on file
          </p>
        )}
      </section>

      {/* 2 — BLOOD GROUP: large tabular mono, its own card. */}
      <section
        className="beacon-rise rounded-[var(--radius)] border border-border bg-card p-5"
        style={rise(2)}
      >
        <div className="flex items-center gap-2">
          <Droplet className="size-5 text-critical" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Blood group
          </h2>
        </div>
        <p className="tabular mt-1 font-mono text-5xl font-bold text-foreground">
          {data.blood_group === "unknown" ? "—" : data.blood_group}
        </p>
        {data.blood_group === "unknown" && (
          <p className="mt-1 text-sm text-muted-foreground">Not on file</p>
        )}
      </section>

      {/* 3 — MEDICATIONS */}
      <Block
        index={3}
        icon={<Pill className="size-5 text-caution" />}
        label="Current medications"
        value={data.medications}
        empty="None on file"
      />

      {/* 4 — CONDITIONS */}
      <Block
        index={4}
        icon={<Stethoscope className="size-5 text-info" />}
        label="Medical conditions"
        value={data.medical_conditions}
        empty="None on file"
      />

      {/* 5 — EMERGENCY CONTACT */}
      <section
        className="beacon-rise rounded-[var(--radius)] border border-border bg-card p-5"
        style={rise(5)}
      >
        <div className="flex items-center gap-2">
          <Phone className="size-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Emergency contact
          </h2>
        </div>
        {data.emergency_contact_name || data.emergency_contact_phone ? (
          <div className="mt-1">
            {data.emergency_contact_name && (
              <p className="text-lg font-medium text-foreground">
                {data.emergency_contact_name}
              </p>
            )}
            {data.emergency_contact_phone && (
              <a
                href={`tel:${data.emergency_contact_phone}`}
                className="tabular font-mono text-xl text-primary underline-offset-2 hover:underline"
              >
                {data.emergency_contact_phone}
              </a>
            )}
          </div>
        ) : (
          <p className="mt-1 text-muted-foreground">None on file</p>
        )}
      </section>

      <footer
        className="beacon-rise mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"
        style={rise(6)}
      >
        <ShieldCheck className="size-3.5" />
        <span>
          Emergency view • accessed{" "}
          <span className="tabular">{formatTime(data.accessed_at)}</span> • this
          access has been logged.
        </span>
      </footer>
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
      className="beacon-rise rounded-[var(--radius)] border border-border bg-card p-5"
      style={rise(index)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </h2>
      </div>
      <p
        className={`mt-1 whitespace-pre-wrap ${
          has ? "text-lg text-foreground" : "text-muted-foreground"
        }`}
      >
        {has ? value : empty}
      </p>
    </section>
  );
}
