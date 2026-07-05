import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Clock } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { practitionerTypeLabel } from "@/lib/roles";
import type { InstitutionRow, InstitutionStaffRosterRow } from "@/lib/database.types";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RosterForm } from "@/components/institution/roster-form";
import { RemoveRosterButton } from "@/components/institution/remove-roster-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff roster",
  robots: { index: false, follow: false },
};

export default async function InstitutionRosterPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/institution/login");

  const { user, profile } = session;
  if (profile.role !== "institution") redirect("/dashboard");

  const supabase = await createClient();
  const { data: institution } = await supabase
    .from("institutions")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle<InstitutionRow>();

  if (!institution || institution.status !== "verified") {
    return (
      <div className="bg-aurora relative min-h-dvh overflow-hidden">
        <div className="grain absolute inset-0" aria-hidden />
        <header className="relative z-10 border-b border-border/70">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4">
            <Brand href="/institution" />
            <SignOutButton variant="outline" />
          </div>
        </header>
        <main className="relative z-10 mx-auto w-full max-w-2xl px-5 py-12">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link href="/institution">
              <ArrowLeft />
              Back to dashboard
            </Link>
          </Button>
          <Alert variant="caution">
            <Clock />
            <AlertTitle>Verification required</AlertTitle>
            <AlertDescription>
              Your facility must be verified before you can declare a staff
              roster.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const { data: entries } = await supabase
    .from("institution_staff_roster")
    .select("*")
    .eq("institution_id", institution.id)
    .order("created_at", { ascending: false });

  const rows = (entries ?? []) as InstitutionStaffRosterRow[];

  return (
    <div className="bg-aurora relative min-h-dvh overflow-hidden">
      <div className="grain absolute inset-0" aria-hidden />

      <header className="relative z-10 border-b border-border/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Brand href="/institution" />
          <SignOutButton variant="outline" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/institution">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>

        <header className="beacon-rise mb-6">
          <span className="data-label text-primary-700">{institution.name}</span>
          <h1 className="font-display mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <ClipboardList className="size-6 text-primary" />
            Staff roster
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Declare the doctors and nurses who actually work here — name and
            council license number. When someone signs up on Beacon and
            requests affiliation with your facility, an admin can cross-check
            their license number against this list before approving them.
            This doesn&apos;t replace their own independent license
            verification — it&apos;s a second, corroborating check.
          </p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add to roster</CardTitle>
          </CardHeader>
          <CardContent>
            <RosterForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Declared staff ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No staff declared yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.full_name}</TableCell>
                      <TableCell className="tabular">{r.license_number}</TableCell>
                      <TableCell>{practitionerTypeLabel(r.practitioner_type)}</TableCell>
                      <TableCell className="text-right">
                        <RemoveRosterButton entryId={r.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
