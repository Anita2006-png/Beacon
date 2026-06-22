import Link from "next/link";
import {
  HeartPulse,
  Lock,
  QrCode,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Lock,
    title: "Encrypted by default",
    body: "Your allergies, medications, and conditions are encrypted before they're stored. Even we can't read them in the clear.",
  },
  {
    icon: QrCode,
    title: "One scan in an emergency",
    body: "Carry a QR code. A responder scans it and sees exactly what they need — fast, and nothing more.",
  },
  {
    icon: ScrollText,
    title: "You see every access",
    body: "Every time your record is opened, it's logged. Open your access log any time to see who looked and when.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-primary">
            <HeartPulse className="size-6" />
            <span className="text-xl font-semibold tracking-tight">Beacon</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your critical medical information, ready the moment it matters.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Beacon is a digital health passport. Store what a responder needs to
            know, carry it as a QR code, and stay in control of who sees it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Create your health passport</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/provider/signup">
                <ShieldCheck />
                I&apos;m a healthcare provider
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-20 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[var(--radius)] border border-border bg-card p-6"
            >
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          Beacon — a digital health passport prototype.
        </div>
      </footer>
    </div>
  );
}
