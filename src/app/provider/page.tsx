import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  PenLine,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { practitionerTypeLabel, roleLabel } from "@/lib/roles";
import type {
  ProviderVerificationRow,
  VerificationStatus,
} from "@/lib/database.types";
import { AvatarInitials } from "@/components/avatar-initials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Doctor home",
  robots: { index: false, follow: false },
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function ProviderHomePage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/provider/login");

  const { user, profile } = session;
  if (profile.role !== "provider") redirect("/dashboard");

  const supabase = await createClient();
  const { data: verification } = await supabase
    .from("provider_verifications")
    .select("status, practitioner_type")
    .eq("provider_id", user.id)
    .maybeSingle<Pick<ProviderVerificationRow, "status" | "practitioner_type">>();

  const practitionerType = verification?.practitioner_type ?? "doctor";
  const label = verification?.practitioner_type
    ? practitionerTypeLabel(verification.practitioner_type)
    : roleLabel(profile.role);

  const status: VerificationStatus =
    verification?.status ??
    (profile.provider_status === "approved" ? "verified" : "pending");
  const approved = status === "verified" || profile.provider_status === "approved";
  const admin = await isAdmin();

  // access_logs has no accessor-read RLS policy (only the patient can read
  // their own), so this doctor's own activity goes through the admin client,
  // scoped to their own id. Any approved provider can edit any patient now —
  // there's no per-doctor "my patients" relationship table, so these stats
  // and the recency list below are derived straight from what this doctor has
  // actually done, not from a roster.
  const adminClient = createAdminClient();
  const [{ count: editsToday }, { count: lookupsToday }, { data: recentActivity }] =
    approved
      ? await Promise.all([
          adminClient
            .from("access_logs")
            .select("*", { count: "exact", head: true })
            .eq("accessor_id", user.id)
            .eq("access_type", "record_edit")
            .gte("created_at", startOfToday()),
          adminClient
            .from("access_logs")
            .select("*", { count: "exact", head: true })
            .eq("accessor_id", user.id)
            .in("access_type", ["national_id_lookup", "email_lookup"])
            .gte("created_at", startOfToday()),
          adminClient
            .from("access_logs")
            .select("patient_id, created_at")
            .eq("accessor_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50),
        ])
      : [{ count: 0 }, { count: 0 }, { data: [] as { patient_id: string }[] }];

  // De-duplicate to the most recent distinct patients, then resolve names.
  const seen = new Set<string>();
  const recentPatientIds: string[] = [];
  for (const row of recentActivity ?? []) {
    if (seen.has(row.patient_id)) continue;
    seen.add(row.patient_id);
    recentPatientIds.push(row.patient_id);
    if (recentPatientIds.length === 6) break;
  }
  const { data: recentPatientRows } = recentPatientIds.length
    ? await adminClient
        .from("medical_profiles")
        .select("id, user_id")
        .in("id", recentPatientIds)
    : { data: [] as { id: string; user_id: string }[] };
  const userIdByMpId = new Map((recentPatientRows ?? []).map((r) => [r.id, r.user_id]));
  const nameUserIds = [...userIdByMpId.values()];
  const { data: nameProfiles } = nameUserIds.length
    ? await adminClient.from("profiles").select("id, full_name").in("id", nameUserIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameByUserId = new Map((nameProfiles ?? []).map((p) => [p.id, p.full_name]));
  const recentPatientNames = recentPatientIds.map(
    (mpId) => nameByUserId.get(userIdByMpId.get(mpId) ?? "") ?? "Patient",
  );

  const stats = [
    { label: "Patients touched", value: seen.size, icon: Users },
    { label: "Edits today", value: editsToday ?? 0, icon: PenLine },
    { label: "Lookups today", value: lookupsToday ?? 0, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="beacon-rise flex items-center gap-4">
        <AvatarInitials name={profile.full_name} />
        <div>
          <span className="data-label text-primary-700">{label} dashboard</span>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {practitionerType === "nurse"
              ? "View and update the patients you have access to."
              : "Manage and view your patients' records."}
          </p>
        </div>
      </header>

      {/* Verification status */}
      <section className="surface beacon-rise overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-primary-800 to-primary-600 px-6 py-3.5 text-primary-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4.5" strokeWidth={2.4} />
            <span className="text-sm font-semibold uppercase tracking-[0.16em]">
              Council verification
            </span>
          </span>
          <Badge
            variant={
              status === "verified" ? "safe" : status === "rejected" ? "critical" : "caution"
            }
          >
            {status === "verified" ? (
              <>
                <CheckCircle2 />
                Verified
              </>
            ) : status === "rejected" ? (
              <>
                <XCircle />
                Not approved
              </>
            ) : (
              <>
                <Clock />
                Pending
              </>
            )}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-lg text-sm text-muted-foreground">
            {approved
              ? "You're approved. Scan a patient's Beacon QR code to view their emergency information, or look them up by national ID / email."
              : status === "rejected"
                ? "Your license couldn't be verified. Review your details and submit again."
                : "Submit your council license so an administrator can approve your access."}
          </p>
          <Button asChild variant={approved ? "outline" : "default"} size="sm">
            <Link href="/provider/verify">
              <ShieldCheck />
              {approved ? "View verification" : "Verify license"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Stat cards */}
      <section className="beacon-rise grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface flex flex-col gap-3 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-display tabular text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="data-label mt-0.5 text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent / approved patients */}
        <section className="surface beacon-rise p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Recently viewed patients
          </h2>
          {recentPatientNames.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No patients yet. Scan a QR code or look one up to get started.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2.5">
              {recentPatientNames.map((name, i) => (
                <li
                  key={recentPatientIds[i]}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-2.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <UserRound className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions / vitals placeholder */}
        {practitionerType === "nurse" ? (
          <section className="surface beacon-rise p-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Vitals overview
            </h2>
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Vitals tracking isn&apos;t built yet — coming soon.
            </p>
          </section>
        ) : (
          <section className="surface beacon-rise p-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Quick actions
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li>
                <Link
                  href="/provider/lookup"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Search className="size-4 text-primary" />
                  Search patient
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/institution"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Building2 className="size-4 text-primary" />
                  Institution affiliation
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/verify"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ShieldCheck className="size-4 text-primary" />
                  Council verification
                </Link>
              </li>
              {admin && (
                <li>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Users className="size-4 text-primary" />
                    Open admin approvals
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
