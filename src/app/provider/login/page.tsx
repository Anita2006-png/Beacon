import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Provider sign in" };

export default async function ProviderLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell
      title="Provider sign in"
      subtitle="Sign in to view emergency medical information."
      footer={
        <>
          Need an account?{" "}
          <Link
            href="/provider/signup"
            className="font-medium text-primary hover:underline"
          >
            Register as a provider
          </Link>
        </>
      }
    >
      <AuthForm mode="login" role="provider" next={sp.next} />
    </AuthShell>
  );
}
