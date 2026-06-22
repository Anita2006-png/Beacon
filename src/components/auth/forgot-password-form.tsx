"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { requestPasswordReset, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="safe" aria-live="polite">
          <MailCheck />
          <AlertDescription>
            If an account exists for that email, we&apos;ve sent a link to reset
            your password. Check your inbox.
          </AlertDescription>
        </Alert>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          Email
          <span aria-hidden className="text-critical"> *</span>
          <span className="sr-only"> (required)</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="you@example.com"
        />
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a link to choose a new password.
        </p>
      </div>
      <SubmitButton />
    </form>
  );
}
