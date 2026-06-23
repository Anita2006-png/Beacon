"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { setEmergencyAccess } from "@/app/(patient)/qr/actions";
import { cn } from "@/lib/utils";

export function EmergencyAccessToggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    startTransition(async () => {
      const res = await setEmergencyAccess(next);
      if (res.error) {
        setOn(!next); // revert
        toast.error(res.error);
      } else {
        toast.success(
          next
            ? "Emergency access is on."
            : "Emergency access paused — your code won't open until you turn it back on.",
        );
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border p-4",
        on ? "border-border bg-card" : "border-caution/40 bg-caution/10",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5",
            on ? "text-safe" : "text-caution",
          )}
        >
          {on ? (
            <ShieldCheck className="size-5" />
          ) : (
            <ShieldOff className="size-5" />
          )}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            Emergency access {on ? "is on" : "is paused"}
          </p>
          <p className="text-sm text-muted-foreground">
            {on
              ? "Approved providers who scan your code can see your record."
              : "Your code won't open for anyone until you turn this back on."}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Emergency access"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          on ? "bg-primary" : "bg-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
            on ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
