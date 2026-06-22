import { ShieldAlert, Users } from "lucide-react";
import { isAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
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
import { ApproveButton } from "@/components/admin/approve-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Provider approvals",
  robots: { index: false, follow: false },
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Alert variant="critical">
            <ShieldAlert />
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              This page is for administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "provider")
    .eq("provider_status", "pending")
    .order("created_at", { ascending: true });

  // Emails live in auth.users; map them in for display.
  const { data: userList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(userList?.users.map((u) => [u.id, u.email ?? ""]));

  const rows = pending ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="beacon-rise mb-7">
        <span className="data-label text-primary-400">Administration</span>
        <h1 className="font-display mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground">
          <Users className="size-7 text-primary" />
          Provider approvals
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review and approve providers before they can open emergency records.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pending providers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No providers are waiting for approval.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="tabular text-muted-foreground">
                      {emailById.get(p.id) ?? "—"}
                    </TableCell>
                    <TableCell className="tabular text-muted-foreground">
                      {formatWhen(p.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ApproveButton
                          providerId={p.id}
                          name={p.full_name ?? "provider"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
