import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; check_email?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your health passport."
      footer={
        <>
          New to Beacon?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {sp.check_email && (
        <Alert variant="info" className="mb-4">
          <MailCheck />
          <AlertDescription>
            Check your email to confirm your account, then sign in.
          </AlertDescription>
        </Alert>
      )}
      <AuthForm mode="login" role="patient" next={sp.next} />
    </AuthShell>
  );
}
