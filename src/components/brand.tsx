import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Beacon wordmark. A gradient-chipped pulse glyph + an editorial serif
 * wordmark. The little "DHP" caption nods to the passport/document concept.
 */
export function Brand({
  href = "/",
  className,
  showCaption = false,
}: {
  href?: string | null;
  className?: string;
  showCaption?: boolean;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-primary-foreground shadow-[0_4px_12px_-2px_rgba(13,148,136,0.5)]">
        <HeartPulse className="size-5" strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Beacon
        </span>
        {showCaption && (
          <span className="data-label mt-1 !text-[0.6rem] !tracking-[0.2em]">
            Health Passport
          </span>
        )}
      </span>
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  );
}
