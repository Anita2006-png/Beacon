import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { PatientNav } from "@/components/patient/patient-nav";

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
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <Brand href="/dashboard" />
          <PatientNav />
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
}
