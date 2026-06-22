"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-[var(--radius)] border border-border bg-card text-foreground shadow-md",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
