import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthEventRow, KnownDeviceRow } from "@/lib/database.types";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { RecentSignIns } from "@/components/security/recent-sign-ins";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

const HOME_BY_ROLE = {
  patient: "/dashboard",
  provider: "/provider",
  institution: "/institution",
} as const;

export default async function SecurityPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");

  const { profile } = session;
  // Admins aren't tracked in auth_events/known_devices at all — nothing to show.
  if (profile.role === "admin") redirect("/admin");

  const home = HOME_BY_ROLE[profile.role as keyof typeof HOME_BY_ROLE] ?? "/dashboard";

  const supabase = await createClient();
  const [{ data: events }, { data: devices }] = await Promise.all([
    supabase
      .from("auth_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("known_devices")
      .select("*")
      .order("last_seen_at", { ascending: false }),
  ]);

  const currentDeviceId = (await cookies()).get("beacon_device_id")?.value ?? null;

  return (
    <div className="bg-aurora relative min-h-dvh overflow-hidden">
      <div className="grain absolute inset-0" aria-hidden />

      <header className="relative z-10 border-b border-border/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Brand href={home} />
          <SignOutButton variant="outline" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href={home}>
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>

        <header className="beacon-rise mb-7">
          <span className="data-label text-primary-700">Account</span>
          <h1 className="font-display mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <ShieldCheck className="size-6 text-primary" />
            Security
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Recent sign-ins to your account and the devices we recognize. If
            something looks wrong, reject it to sign out everywhere else.
          </p>
        </header>

        <RecentSignIns
          events={(events ?? []) as AuthEventRow[]}
          devices={(devices ?? []) as KnownDeviceRow[]}
          currentDeviceId={currentDeviceId}
        />
      </main>
    </div>
  );
}
