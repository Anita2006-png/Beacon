import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/sidebar-shell";

// Private area — never index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Matches the notifications page: "unread" is a recency window (last 7 days
// of access_logs), not a real read/unread flag — there's no such column.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  // Providers don't have a patient passport — send them to their own area.
  if (session.profile.role === "provider") redirect("/provider");

  const supabase = await createClient();
  const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
  const { count: unread } = await supabase
    .from("access_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  const patientNav: SidebarNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/passport", label: "My passport", icon: "passport" },
    { href: "/profile/edit", label: "Profile", icon: "profile" },
    { href: "/qr", label: "QR code", icon: "qr" },
    {
      href: "/notifications",
      label: "Notifications",
      icon: "notifications",
      badge: unread ?? 0,
    },
    { href: "/access-log", label: "Access log", icon: "access-log" },
  ];

  return (
    <SidebarShell navItems={patientNav} brandHref="/dashboard">
      {children}
    </SidebarShell>
  );
}
