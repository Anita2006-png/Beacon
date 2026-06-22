"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, QrCode, UserPen } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile/edit", label: "Profile", icon: UserPen },
  { href: "/qr", label: "QR code", icon: QrCode },
  { href: "/access-log", label: "Access log", icon: ClipboardList },
];

export function PatientNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-800"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
