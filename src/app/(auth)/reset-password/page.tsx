import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Almost done — pick a new password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
