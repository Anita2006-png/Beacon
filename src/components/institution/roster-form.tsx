"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addRosterEntry, type RosterActionState } from "@/app/institution/roster/actions";
import { PRACTITIONER_TYPES } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <UserPlus />
      {pending ? "Adding…" : "Add to roster"}
    </Button>
  );
}

export function RosterForm() {
  const [state, formAction] = useActionState<RosterActionState, FormData>(
    addRosterEntry,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const lastOk = useRef(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) {
      lastOk.current = true;
      toast.success("Added to your staff roster.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="critical">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="off"
            placeholder="Dr. Adaeze Okoro"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="license_number">Council license number</Label>
          <Input
            id="license_number"
            name="license_number"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="tabular"
            placeholder="e.g. MDCN-123456"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="practitioner_type">Type</Label>
          <select
            id="practitioner_type"
            name="practitioner_type"
            defaultValue="doctor"
            className="border-input bg-card focus-visible:ring-ring flex min-h-11 w-full rounded-[var(--radius)] border px-3 py-2 text-base shadow-sm focus:outline-none focus-visible:ring-2"
          >
            {PRACTITIONER_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.council})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
