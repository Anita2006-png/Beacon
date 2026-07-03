import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ProviderVerificationRow } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LicenseUploadForm } from "@/components/provider/license-upload-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Council license verification",
  robots: { index: false, follow: false },
};

export default async function ProviderVerifyPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/provider/login");

  const { user, profile } = session;
  if (profile.role !== "provider") redirect("/dashboard");

  // The doctor reads their OWN verification row via RLS.
  const supabase = await createClient();
  const { data: verification } = await supabase
    .from("provider_verifications")
    .select("*")
    .eq("provider_id", user.id)
    .maybeSingle<ProviderVerificationRow>();

  const status = verification?.status;
  const canResubmit = !verification || status === "rejected";

  const metaLicense =
    (user.user_metadata?.license_number as string | undefined) ?? "";
  const defaultLicenseNumber = verification?.license_number ?? metaLicense;

  const metaPractitionerType =
    (user.user_metadata?.practitioner_type as string | undefined) ?? "doctor";
  const defaultPractitionerType =
    verification?.practitioner_type ?? metaPractitionerType;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/provider">
          <ArrowLeft />
          Back to dashboard
        </Link>
      </Button>

      <div className="beacon-rise surface-lift overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-4 text-primary-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-5" strokeWidth={2.4} />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                Council license verification
              </span>
            </span>
          </div>

          <div className="p-7">
            {status === "verified" && (
              <Alert variant="safe">
                <CheckCircle2 />
                <AlertTitle>Your license is verified</AlertTitle>
                <AlertDescription>
                  You&apos;re approved to open patient emergency records. There
                  is nothing more to do here.
                </AlertDescription>
              </Alert>
            )}

            {status === "pending" && (
              <Alert variant="caution">
                <Clock />
                <AlertTitle>Verification in review</AlertTitle>
                <AlertDescription>
                  We&apos;ve received your license{" "}
                  <span className="tabular font-medium">
                    {verification?.license_number}
                  </span>{" "}
                  and an administrator is reviewing it. You&apos;ll be approved
                  once the check is complete.
                </AlertDescription>
              </Alert>
            )}

            {status === "rejected" && (
              <Alert variant="critical" className="mb-6">
                <XCircle />
                <AlertTitle>Verification was not approved</AlertTitle>
                <AlertDescription>
                  {verification?.notes
                    ? verification.notes
                    : "Your previous submission couldn't be verified."}{" "}
                  Please check your details and submit again.
                </AlertDescription>
              </Alert>
            )}

            {canResubmit ? (
              <>
                {!verification && (
                  <div className="mb-6">
                    <span className="data-label">Submit your credentials</span>
                    <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
                      Verify your council license
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Upload a copy of your license so an administrator can
                      approve your access to emergency records.
                    </p>
                  </div>
                )}
                <LicenseUploadForm
                  defaultLicenseNumber={defaultLicenseNumber}
                  defaultPractitionerType={defaultPractitionerType}
                />
              </>
            ) : (
              <div className="mt-6 flex items-center gap-2">
                <span className="data-label">Current status</span>
                <Badge variant={status === "verified" ? "safe" : "caution"}>
                  {status === "verified" ? (
                    <>
                      <CheckCircle2 />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
