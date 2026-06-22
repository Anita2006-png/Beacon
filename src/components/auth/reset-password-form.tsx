"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { updatePassword, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending || disabled}
    >
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <Alert variant="critical" aria-live="assertive">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">
          New password
          <span aria-hidden className="text-critical"> *</span>
          <span className="sr-only"> (required)</span>
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="new-password-hint"
          placeholder="Create a new password"
        />
        <p id="new-password-hint" className="text-sm text-muted-foreground">
          Use at least 8 characters.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">
          Confirm password
          <span aria-hidden className="text-critical"> *</span>
          <span className="sr-only"> (required)</span>
        </Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={mismatch}
          aria-describedby={mismatch ? "confirm-error" : undefined}
          placeholder="Re-enter your new password"
        />
        {mismatch && (
          <p id="confirm-error" className="text-sm text-critical" role="alert">
            Those passwords don&apos;t match.
          </p>
        )}
      </div>

      <SubmitButton disabled={mismatch || tooShort || password.length === 0} />
    </form>
  );
}
