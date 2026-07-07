"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookUser,
  Building2,
  ClipboardList,
  FileSearch,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  QrCode,
  ScrollText,
  Search,
  ShieldCheck,
  UserCheck,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

/**
 * Icon registry, keyed by name. Server Component layouts can only pass plain
 * serializable data as props to this Client Component — a Lucide icon
 * *component reference* is a function/forwardRef object, not plain data, so
 * it can't cross that boundary. Passing a string key instead, resolved here,
 * sidesteps that entirely.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  passport: BookUser,
  profile: UserPen,
  qr: QrCode,
  notifications: Bell,
  "access-log": ClipboardList,
  lookup: Search,
  institution: Building2,
  verify: ShieldCheck,
  verifications: UserCheck,
  institutions: Building2,
  records: FileSearch,
  audit: ScrollText,
  "auth-log": KeyRound,
  security: Fingerprint,
} satisfies Record<string, LucideIcon>;

export type SidebarIconName = keyof typeof ICONS;

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: SidebarIconName;
  /** Small count pill next to the label (e.g. unread notifications). Omit or 0 to hide it. */
  badge?: number;
}

/**
 * Shared app shell: a persistent left sidebar on desktop (deep teal, matching
 * the brand palette) collapsing to a top bar + scrollable pill nav on mobile.
 * Used by the patient, provider, and admin sections alike — each passes its
 * own nav items, everything else (chrome, active-state logic) is shared.
 */
export function SidebarShell({
  navItems,
  brandHref,
  children,
}: {
  navItems: SidebarNavItem[];
  brandHref: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-primary-900 to-primary-950 md:flex">
        <div className="px-6 py-6">
          <Brand href={brandHref} light />
        </div>
        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon, badge }) => {
              const active = isActive(href);
              const Icon = ICONS[icon];
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-800/70 text-white shadow-sm"
                        : "text-primary-200/75 hover:bg-primary-800/40 hover:text-white",
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {Boolean(badge) && (
                      <span className="inline-grid min-w-5 place-items-center rounded-full bg-primary-400 px-1.5 py-0.5 text-xs font-semibold text-primary-950">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-primary-800/60 px-4 py-4">
          <SignOutButton
            variant="ghost"
            className="w-full justify-start text-primary-200/80 hover:bg-primary-800/50 hover:text-white"
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar + scrollable nav */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Brand href={brandHref} />
            <SignOutButton />
          </div>
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map(({ href, label, icon, badge }) => {
              const active = isActive(href);
              const Icon = ICONS[icon];
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-800"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                  {Boolean(badge) && (
                    <span className="inline-grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
