"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { approveProvider, type ApproveState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <CheckCircle2 />
      {pending ? "Approving…" : "Approve"}
    </Button>
  );
}

export function ApproveButton({
  providerId,
  name,
}: {
  providerId: string;
  name: string;
}) {
  const [state, formAction] = useActionState<ApproveState, FormData>(
    approveProvider,
    {},
  );
  const lastError = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="provider_id" value={providerId} />
      <Inner />
      <span className="sr-only">Approve {name}</span>
    </form>
  );
}
