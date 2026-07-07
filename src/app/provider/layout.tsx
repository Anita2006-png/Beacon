import { getCurrentProfile } from "@/lib/auth";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/sidebar-shell";

const PROVIDER_NAV: SidebarNavItem[] = [
  { href: "/provider", label: "Dashboard", icon: "dashboard" },
  { href: "/provider/lookup", label: "Patient lookup", icon: "lookup" },
  { href: "/provider/institution", label: "Institution", icon: "institution" },
  { href: "/provider/verify", label: "Verification", icon: "verify" },
  { href: "/security", label: "Security", icon: "security" },
];

/**
 * Shell for the doctor/nurse area. Only wraps pages once signed in as a
 * provider — /provider/login, /signup, /pending are reachable with no
 * session (that's the whole point of them), so they pass through untouched
 * rather than getting an authenticated sidebar around a login form.
 */
export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentProfile();
  if (session?.profile.role !== "provider") return <>{children}</>;

  return (
    <SidebarShell navItems={PROVIDER_NAV} brandHref="/provider">
      {children}
    </SidebarShell>
  );
}
