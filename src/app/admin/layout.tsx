import { isAdmin } from "@/lib/admin-guard";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/sidebar-shell";

const ADMIN_NAV: SidebarNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/verifications", label: "Provider approvals", icon: "verifications" },
  { href: "/admin/institutions", label: "Facility approvals", icon: "institutions" },
  { href: "/admin/records", label: "Find a record", icon: "records" },
  { href: "/admin/audit", label: "Audit log", icon: "audit" },
  { href: "/admin/auth-log", label: "Auth activity", icon: "auth-log" },
];

/** Shell for the admin area — only wraps pages once confirmed as an admin
 *  (allowlist-based, not a role); otherwise pass through so each page's own
 *  "Access restricted" alert renders plainly, with no sidebar around it. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) return <>{children}</>;

  return (
    <SidebarShell navItems={ADMIN_NAV} brandHref="/admin">
      {children}
    </SidebarShell>
  );
}
