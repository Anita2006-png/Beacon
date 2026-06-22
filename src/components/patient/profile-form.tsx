"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Droplet, Pill, Stethoscope, TriangleAlert, UserRound } from "lucide-react";
import {
  saveMedicalProfile,
  type SaveState,
} from "@/app/(patient)/profile/edit/actions";
import { BLOOD_GROUPS } from "@/lib/validation";
import type { DecryptedMedicalProfile } from "@/lib/medical";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save profile"}
    </Button>
  );
}

export function ProfileForm({
  initial,
}: {
  initial: DecryptedMedicalProfile | null;
}) {
  const [state, formAction] = useActionState<SaveState, FormData>(
    saveMedicalProfile,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <Alert variant="critical">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Section
        icon={<Droplet className="size-5" />}
        title="Blood group"
        description="Shown first in an emergency."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="blood_group">Blood group</Label>
          <Select
            name="blood_group"
            defaultValue={initial?.blood_group ?? "unknown"}
          >
            <SelectTrigger id="blood_group" className="tabular max-w-40">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((g) => (
                <SelectItem key={g} value={g} className="tabular">
                  {g === "unknown" ? "Unknown" : g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section
        icon={<TriangleAlert className="size-5" />}
        title="Allergies"
        description="List anything you're allergic to — medicines, foods, materials."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            name="allergies"
            defaultValue={initial?.allergies ?? ""}
            placeholder="e.g. Penicillin, peanuts, latex"
          />
          <p className="text-sm text-muted-foreground">
            Add your allergies so they&apos;re there in an emergency.
          </p>
        </div>
      </Section>

      <Section
        icon={<Pill className="size-5" />}
        title="Current medications"
        description="Medicines you take regularly, with doses if you know them."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="medications">Medications</Label>
          <Textarea
            id="medications"
            name="medications"
            defaultValue={initial?.medications ?? ""}
            placeholder="e.g. Metformin 500mg twice daily"
          />
        </div>
      </Section>

      <Section
        icon={<Stethoscope className="size-5" />}
        title="Medical conditions"
        description="Ongoing conditions a clinician should know about."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="medical_conditions">Conditions</Label>
          <Textarea
            id="medical_conditions"
            name="medical_conditions"
            defaultValue={initial?.medical_conditions ?? ""}
            placeholder="e.g. Type 2 diabetes, high blood pressure"
          />
        </div>
      </Section>

      <Section
        icon={<UserRound className="size-5" />}
        title="Emergency contact"
        description="Someone we can point a responder to."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="emergency_contact_name">Contact name</Label>
          <Input
            id="emergency_contact_name"
            name="emergency_contact_name"
            defaultValue={initial?.emergency_contact_name ?? ""}
            placeholder="e.g. Sam Rivera (sister)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="emergency_contact_phone">Contact phone</Label>
          <Input
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            type="tel"
            inputMode="tel"
            className="tabular"
            defaultValue={initial?.emergency_contact_phone ?? ""}
            placeholder="+234 800 000 0000"
          />
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <SaveButton />
      </div>
    </form>
  );
}
