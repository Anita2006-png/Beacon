import Link from "next/link";
import Image from "next/image";
import { HeartPulse } from "lucide-react";
import { getOwnMedicalProfile } from "@/lib/medical";
import { emergencyUrl, qrDataUrl } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrActions } from "@/components/patient/qr-actions";

export default async function QrPage() {
  const profile = await getOwnMedicalProfile();

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your QR code
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your health passport first and we&apos;ll generate a code you
          can carry.
        </p>
        <Button asChild className="mt-6">
          <Link href="/profile/edit">Create your profile</Link>
        </Button>
      </div>
    );
  }

  const dataUrl = await qrDataUrl(profile.qr_token);
  const url = emergencyUrl(profile.qr_token);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your QR code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Print it on a card, save it in your wallet, or stick it on your phone
          case. A responder scans it to see your critical information.
        </p>
      </div>

      {/* Printable card */}
      <Card className="print:shadow-none">
        <CardHeader className="items-center text-center">
          <div className="flex items-center gap-2 text-primary">
            <HeartPulse className="size-5" />
            <CardTitle>Beacon emergency card</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Image
            src={dataUrl}
            alt="Your Beacon emergency QR code"
            width={256}
            height={256}
            className="rounded-lg border border-border"
            unoptimized
          />
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            In an emergency, scan this code or visit:
          </p>
          <p className="tabular break-all text-center text-xs text-muted-foreground">
            {url}
          </p>
        </CardContent>
      </Card>

      <div className="print:hidden">
        <QrActions dataUrl={dataUrl} />
      </div>
    </div>
  );
}
