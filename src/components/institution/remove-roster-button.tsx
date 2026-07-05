"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  removeRosterEntry,
  type RosterActionState,
} from "@/app/institution/roster/actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      <Trash2 />
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}

export function RemoveRosterButton({ entryId }: { entryId: string }) {
  const [state, formAction] = useActionState<RosterActionState, FormData>(
    removeRosterEntry,
    {},
  );
  const last = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.error && state.error !== last.current) {
      last.current = state.error;
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="entry_id" value={entryId} />
      <SubmitButton />
    </form>
  );
}
