import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-primary"
        >
          <HeartPulse className="size-6" />
          <span className="text-xl font-semibold tracking-tight">Beacon</span>
        </Link>

        <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className={subtitle ? "" : "mt-6"}>{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </p>
        )}
      </div>
    </main>
  );
}
