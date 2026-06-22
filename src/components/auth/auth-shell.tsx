import { Brand } from "@/components/brand";

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
    <main className="bg-aurora relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="grain absolute inset-0" aria-hidden />

      <div className="beacon-rise relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand href="/" showCaption />
        </div>

        <div className="surface-lift bg-guilloche overflow-hidden">
          {/* Document header strip */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-primary-foreground">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
              {title}
            </span>
            <span className="font-mono text-[0.65rem] opacity-80">DHP-01</span>
          </div>

          <div className="p-7">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
            <div className="mt-6">{children}</div>
          </div>
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
