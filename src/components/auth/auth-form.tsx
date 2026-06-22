"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import {
  signInAction,
  signUpAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Just a moment…" : label}
    </Button>
  );
}

export function AuthForm({
  mode,
  role = "patient",
  next,
}: {
  mode: "login" | "signup";
  role?: "patient" | "provider";
  next?: string;
}) {
  const action = mode === "signup" ? signUpAction : signInAction;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {role === "provider" && <input type="hidden" name="role" value="provider" />}
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <Alert variant="critical">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {mode === "signup" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
            placeholder="Jordan Rivera"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>

      <SubmitButton label={mode === "signup" ? "Create account" : "Sign in"} />
    </form>
  );
}
