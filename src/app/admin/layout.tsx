import { isAdmin } from "@/lib/admin-guard";
import { getSessionUser } from "@/lib/auth";
import { getNewAuthEventCount } from "@/lib/admin-auth-log";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/sidebar-shell";

/** Shell for the admin area — only wraps pages once confirmed as an admin
 *  (allowlist-based, not a role); otherwise pass through so each page's own
 *  "Access restricted" alert renders plainly, with no sidebar around it. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) return <>{children}</>;

  const user = await getSessionUser();
  const newAuthEvents = user ? await getNewAuthEventCount(user.id) : 0;

  const adminNav: SidebarNavItem[] = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/approvals", label: "Approvals", icon: "verifications" },
    { href: "/admin/records", label: "Find a record", icon: "records" },
    { href: "/admin/audit", label: "Audit log", icon: "audit" },
    {
      href: "/admin/auth-log",
      label: "Auth activity",
      icon: "auth-log",
      badge: newAuthEvents,
    },
  ];

  return (
    <SidebarShell navItems={adminNav} brandHref="/admin">
      {children}
    </SidebarShell>
  );
}
