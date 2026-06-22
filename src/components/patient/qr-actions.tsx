"use client";

import { useState, useTransition } from "react";
import { Download, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { regenerateQrToken } from "@/app/(patient)/qr/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QrActions({ dataUrl }: { dataUrl: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function download() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "beacon-qr.png";
    a.click();
    toast.success("QR code downloaded");
  }

  function handleRegenerate() {
    startTransition(async () => {
      const res = await regenerateQrToken();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("New code generated. The old one no longer works.");
        setOpen(false);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={download} variant="default">
        <Download />
        Download printable card
      </Button>
      <Button onClick={() => window.print()} variant="outline">
        <Printer />
        Print
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <RefreshCw />
            Regenerate code
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate your QR code?</DialogTitle>
            <DialogDescription>
              This creates a brand-new code and immediately invalidates the old
              one. Any printed card or saved image you&apos;ve shared will stop
              working. You&apos;ll need to download and reprint the new code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="critical"
              onClick={handleRegenerate}
              disabled={pending}
            >
              {pending ? "Regenerating…" : "Regenerate code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
