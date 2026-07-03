import Link from "next/link";
import { BookUser, Pencil, ScanLine } from "lucide-react";
import { getOwnMedicalProfileDecrypted } from "@/lib/medical";
import { Button } from "@/components/ui/button";
import { PassportTabs } from "@/components/patient/passport-tabs";
import { RecordExport } from "@/components/patient/record-export";

export default async function PassportPage() {
  const profile = await getOwnMedicalProfileDecrypted();

  if (!profile) {
    return (
      <div className="surface mx-auto w-full max-w-md p-10 text-center">
        <ScanLine className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight">
          My health passport
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your profile first, then it will appear here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/profile/edit">Create your profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="beacon-rise flex items-start justify-between gap-4">
        <div>
          <span className="data-label flex items-center gap-2 text-primary-700">
            <BookUser className="size-4" />
            My health passport
          </span>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
            Your encrypted health information
          </h1>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/profile/edit">
            <Pencil />
            Edit
          </Link>
        </Button>
      </header>

      <PassportTabs profile={profile} />

      <RecordExport />
    </div>
  );
}
