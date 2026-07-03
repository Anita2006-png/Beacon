import { HeartPulse } from "lucide-react";
import type { EmergencyView } from "@/lib/emergency";
import {
  recordContacts,
  recordInfoGrid,
  recordMedicalColumns,
  recordNotes,
  CONFIDENTIALITY_NOTICE,
} from "@/lib/record-content";

/**
 * A clean, document-style presentation of a patient record — organized the
 * same way as the PDF/Word export (same content helpers, so the three stay
 * in lockstep): an identity info grid, a 3-column Allergies/Medications/
 * Conditions table, notes, then contacts. Used wherever a professional is
 * reviewing a record after a deliberate search (admin "Find a record",
 * provider patient lookup) — as opposed to TriageCard's loud, allergy-first
 * "emergency ID card" treatment, which stays reserved for the anonymous
 * bystander-facing QR scan.
 */
export function RecordView({
  data,
  qrToken,
}: {
  data: EmergencyView;
  qrToken?: string;
}) {
  const info = recordInfoGrid(data, qrToken);
  const medical = recordMedicalColumns(data);
  const notes = recordNotes(data);
  const contacts = recordContacts(data);

  return (
    <div className="surface-lift overflow-hidden">
      <header className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-4 text-primary-foreground">
        <span className="flex items-center gap-2">
          <HeartPulse className="size-4" strokeWidth={2.4} />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Health Passport
          </span>
        </span>
        <span className="font-mono text-[0.65rem] opacity-80">BEACON</span>
      </header>

      <div className="flex flex-col gap-6 p-6">
        {/* Identity info grid */}
        <section className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          {info.map((f) => (
            <div key={f.label}>
              <span className="data-label">{f.label}</span>
              <p className="data-value mt-0.5 font-semibold text-foreground">
                {f.value}
              </p>
            </div>
          ))}
        </section>

        <hr className="rule-dotted" />

        {/* 3-column medical table */}
        <section>
          <span className="data-label text-primary-700">
            Medical information
          </span>
          <div className="mt-3 grid gap-5 sm:grid-cols-3">
            {medical.map((col) => (
              <div key={col.heading}>
                <span
                  className={
                    col.critical
                      ? "data-label !text-critical"
                      : "data-label"
                  }
                >
                  {col.heading}
                </span>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {col.items.map((item, i) => (
                    <li
                      key={i}
                      className={
                        col.empty
                          ? "text-sm text-muted-foreground"
                          : col.critical
                            ? "text-sm font-medium text-critical"
                            : "text-sm text-foreground"
                      }
                    >
                      {col.empty ? item : `• ${item}`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {notes && (
          <>
            <hr className="rule-dotted" />
            <section>
              <span className="data-label text-primary-700">
                Additional notes
              </span>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">
                {notes}
              </p>
            </section>
          </>
        )}

        <hr className="rule-dotted" />

        {/* Contacts table */}
        <section>
          <span className="data-label text-primary-700">
            Emergency contact
          </span>
          <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border border-border">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
                <p className="data-value text-sm text-foreground">
                  {c.phone}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="rule-dotted px-6 py-4 text-xs text-muted-foreground">
        {CONFIDENTIALITY_NOTICE}
      </footer>
    </div>
  );
}
