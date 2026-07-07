import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { FacilityType } from "@/lib/database.types";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Doctor & nurse registration",
  description:
    "Doctors (MDCN) and nurses/midwives (NMCN): register for Beacon to access patients' emergency medical information once approved.",
};

export default async function ProviderSignupPage() {
  // Public read of verified facilities (inst_select_verified_public policy) —
  // lets a not-yet-signed-in doctor pick their facility right at signup
  // instead of a separate step afterward.
  const supabase = await createClient();
  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name, facility_type")
    .eq("status", "verified")
    .order("name", { ascending: true });

  return (
    <AuthShell
      title="Doctor & nurse registration"
      subtitle="Register to access emergency medical information when it matters."
      footer={
        <>
          Already registered?{" "}
          <Link
            href="/provider/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
          <br />
          <span className="mt-2 inline-block">
            Represent a hospital or clinic instead?{" "}
            <Link
              href="/institution/signup"
              className="font-medium text-primary hover:underline"
            >
              Register your facility
            </Link>
          </span>
        </>
      }
    >
      <Alert variant="info" className="mb-4">
        <ShieldCheck />
        <AlertDescription>
          New accounts are reviewed before they can access patient data.
          You&apos;ll be able to sign in once an administrator approves you.
        </AlertDescription>
      </Alert>
      <AuthForm
        mode="signup"
        role="provider"
        institutions={(institutions ?? []) as { id: string; name: string; facility_type: FacilityType }[]}
      />
    </AuthShell>
  );
}
