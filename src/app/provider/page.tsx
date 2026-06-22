import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, QrCode, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProviderHomePage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/provider/login");

  const { user, profile } = session;
  if (profile.role !== "provider") redirect("/dashboard");

  const approved = profile.provider_status === "approved";
  const admin = await isAdmin();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-6" />
          <span className="text-xl font-semibold tracking-tight">
            Beacon for providers
          </span>
        </div>
        <SignOutButton />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Welcome{profile.full_name ? `, ${profile.full_name}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Account status</span>
            {approved ? (
              <Badge variant="safe">
                <CheckCircle2 />
                Approved
              </Badge>
            ) : (
              <Badge variant="caution">
                <Clock />
                Pending approval
              </Badge>
            )}
          </div>

          {approved ? (
            <p className="text-sm text-foreground">
              You&apos;re approved. To view a patient&apos;s emergency
              information, scan their Beacon QR code with your phone camera — it
              opens the emergency view directly. Every access is logged.
            </p>
          ) : (
            <p className="text-sm text-foreground">
              Your account is awaiting administrator approval. You&apos;ll be able
              to open emergency views as soon as you&apos;re approved.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Signed in as <span className="tabular">{user.email}</span>
          </p>
        </CardContent>
      </Card>

      {admin && (
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/admin">
              <QrCode />
              Open admin approvals
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
