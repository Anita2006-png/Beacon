import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { PatientNav } from "@/components/patient/patient-nav";

// Private area — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  // Providers don't have a patient passport — send them to their own area.
  if (session.profile.role === "provider") redirect("/provider");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-5">
          {/* Row 1: brand + sign out always pinned; nav inline on desktop */}
          <div className="flex items-center justify-between gap-3 py-3">
            <Brand href="/dashboard" className="shrink-0" />
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <PatientNav />
            </div>
            <div className="shrink-0">
              <SignOutButton />
            </div>
          </div>
          {/* Row 2: scrollable nav on mobile only */}
          <div className="-mx-4 border-t border-border px-4 pb-2 pt-2 md:hidden">
            <PatientNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
}
