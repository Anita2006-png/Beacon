"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import {
  submitClinicalEdit,
  type ClinicalEditState,
} from "@/app/provider/lookup/actions";
import type { EmergencyView } from "@/lib/emergency";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <PenLine />
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

/** Any approved provider can edit a patient's clinical fields directly —
 *  no request/approval step. Still logged and the patient still notified. */
export function CareAccessPanel({
  patientUserId,
  view,
}: {
  patientUserId: string;
  view: EmergencyView;
}) {
  const [state, formAction] = useActionState<ClinicalEditState, FormData>(
    submitClinicalEdit,
    {},
  );
  const lastOk = useRef(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) {
      lastOk.current = true;
      toast.success("Saved. The patient is notified of this change.");
    }
  }, [state]);

  return (
    <Card className="mx-auto mt-4 w-full max-w-xl">
      <CardHeader>
        <CardTitle>Edit clinical information</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="patient_user_id" value={patientUserId} />
          {state.error && (
            <Alert variant="critical">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              defaultValue={view.allergies}
              placeholder="e.g. Penicillin, peanuts, latex"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="medications">Medications</Label>
            <Textarea
              id="medications"
              name="medications"
              defaultValue={view.medications}
              placeholder="e.g. Metformin 500mg twice daily"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="medical_conditions">Medical conditions</Label>
            <Textarea
              id="medical_conditions"
              name="medical_conditions"
              defaultValue={view.medical_conditions}
              placeholder="e.g. Type 2 diabetes, high blood pressure"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="additional_notes">Other notes</Label>
            <Textarea
              id="additional_notes"
              name="additional_notes"
              defaultValue={view.additional_notes}
              placeholder="Anything else a responder should know"
            />
          </div>

          <div>
            <SaveButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
