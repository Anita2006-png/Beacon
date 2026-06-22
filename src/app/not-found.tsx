import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-aurora relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10 text-center">
      <div className="grain absolute inset-0" aria-hidden />

      <div className="beacon-rise relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand href="/" showCaption />
        </div>

        <div className="surface-lift bg-guilloche overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-primary-foreground">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
              Page not found
            </span>
            <span className="font-mono text-[0.65rem] opacity-80">ERR-404</span>
          </div>

          <div className="flex flex-col items-center p-8">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary-700">
              <Compass className="size-7" />
            </span>
            <p className="data-value mt-6 text-6xl font-bold text-foreground">
              404
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight">
              We couldn&apos;t find that page
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The link may be broken, or the page may have moved. Let&apos;s get
              you back to safety.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link href="/">
                <Home />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
