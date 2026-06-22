import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ScanLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-guard";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export default async function ProviderHomePage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/provider/login");

  const { user, profile } = session;
  if (profile.role !== "provider") redirect("/dashboard");

  const approved = profile.provider_status === "approved";
  const admin = await isAdmin();

  return (
    <div className="bg-aurora relative min-h-dvh overflow-hidden">
      <div className="grain absolute inset-0" aria-hidden />

      <header className="relative z-10 border-b border-border/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Brand href="/provider" />
          <SignOutButton variant="outline" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-12">
        <div className="beacon-rise surface-lift bg-guilloche overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-4 text-primary-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-5" strokeWidth={2.4} />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                Provider access
              </span>
            </span>
            {approved ? (
              <span className="beacon-stamp inline-flex items-center gap-1.5 rounded-md border-2 border-white/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="size-3.5" />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
                <Clock className="size-3.5" />
                Pending
              </span>
            )}
          </div>

          <div className="p-7">
            <span className="data-label">Signed in as</span>
            <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
              {profile.full_name || "Provider"}
            </h1>
            <p className="data-value mt-0.5 text-sm text-muted-foreground">
              {user.email}
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
              {approved ? (
                <div className="flex items-start gap-3">
                  <ScanLine className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">
                    You&apos;re approved. To view a patient&apos;s emergency
                    information, scan their Beacon QR code with your phone camera
                    — it opens the emergency view directly.{" "}
                    <span className="text-muted-foreground">
                      Every access is logged.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-caution" />
                  <p className="text-sm leading-relaxed text-foreground">
                    Your account is awaiting administrator approval. You&apos;ll
                    be able to open emergency views as soon as you&apos;re
                    approved.
                  </p>
                </div>
              )}
            </div>

            {admin && (
              <Button asChild variant="outline" className="mt-5">
                <Link href="/admin">
                  <Users />
                  Open admin approvals
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
