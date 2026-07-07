import { ShieldAlert, UserCheck } from "lucide-react";
import { isAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { signedInstitutionUrl, signedLicenseUrl } from "@/lib/storage";
import type {
  InstitutionRow,
  ProviderVerificationRow,
} from "@/lib/database.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApprovalsTabs } from "@/components/admin/approvals-tabs";
import { ApprovalsPending } from "@/components/admin/approvals-pending";
import { ApprovalsByFacility, type FacilityGroup } from "@/components/admin/approvals-by-facility";
import { ApprovalsUnaffiliated } from "@/components/admin/approvals-unaffiliated";
import type { ProviderSummary } from "@/components/admin/provider-summary-row";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Approvals",
  robots: { index: false, follow: false },
};

export default async function AdminApprovalsPage() {
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

  const [
    { data: pendingInstitutions },
    { data: verifiedInstitutions },
    { data: pendingVerifications },
    { data: allVerifications },
    { data: allProviders },
    { data: approvedMemberships },
    { data: rosterEntries },
    { data: userList },
  ] = await Promise.all([
    admin.from("institutions").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("institutions").select("*").eq("status", "verified").order("name", { ascending: true }),
    admin.from("provider_verifications").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("provider_verifications").select("*"),
    admin.from("profiles").select("id, full_name, restricted").eq("role", "provider"),
    admin.from("institution_members").select("institution_id, member_id").eq("status", "approved"),
    admin.from("institution_staff_roster").select("institution_id, license_number"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const pendingInst = (pendingInstitutions ?? []) as InstitutionRow[];
  const verifiedInst = (verifiedInstitutions ?? []) as InstitutionRow[];
  const pendingVer = (pendingVerifications ?? []) as ProviderVerificationRow[];
  const allVer = (allVerifications ?? []) as ProviderVerificationRow[];
  const providers = allProviders ?? [];
  const memberships = approvedMemberships ?? [];

  const emailById = new Map((userList?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const providerNameById = new Map(providers.map((p) => [p.id, p.full_name]));
  const providerRestrictedById = new Map(providers.map((p) => [p.id, p.restricted]));
  const verificationByProviderId = new Map(allVer.map((v) => [v.provider_id, v]));

  // Short-lived signed document URLs for each pending queue.
  const institutionDocUrlById = new Map<string, string | null>();
  await Promise.all(
    pendingInst.map(async (i) => {
      if (i.registration_document_path) {
        institutionDocUrlById.set(i.id, await signedInstitutionUrl(i.registration_document_path));
      }
    }),
  );
  const verificationDocUrlById = new Map<string, string | null>();
  await Promise.all(
    pendingVer.map(async (v) => {
      if (v.license_document_path) {
        verificationDocUrlById.set(v.id, await signedLicenseUrl(v.license_document_path));
      }
    }),
  );

  // Roster-match signal, same as the old /admin/verifications page.
  const institutionIdsForRoster = [
    ...new Set((rosterEntries ?? []).map((e) => e.institution_id)),
  ];
  const { data: rosterInstitutions } = institutionIdsForRoster.length
    ? await admin.from("institutions").select("id, name").in("id", institutionIdsForRoster)
    : { data: [] as { id: string; name: string }[] };
  const rosterInstitutionNameById = new Map((rosterInstitutions ?? []).map((i) => [i.id, i.name]));
  const rosterMatchByLicense = new Map<string, string[]>();
  for (const entry of rosterEntries ?? []) {
    const key = entry.license_number.trim().toUpperCase();
    const institutionName = rosterInstitutionNameById.get(entry.institution_id) ?? "a facility";
    const list = rosterMatchByLicense.get(key) ?? [];
    list.push(institutionName);
    rosterMatchByLicense.set(key, list);
  }

  function providerSummary(providerId: string): ProviderSummary {
    const verification = verificationByProviderId.get(providerId);
    return {
      userId: providerId,
      name: providerNameById.get(providerId) ?? null,
      email: emailById.get(providerId) ?? null,
      practitionerType: verification?.practitioner_type ?? null,
      council: verification?.council ?? null,
      licenseNumber: verification?.license_number ?? null,
      verificationStatus: verification?.status ?? null,
      isRestricted: providerRestrictedById.get(providerId) ?? false,
    };
  }

  // Group approved memberships by facility.
  const memberIdsByInstitution = new Map<string, string[]>();
  for (const m of memberships) {
    const list = memberIdsByInstitution.get(m.institution_id) ?? [];
    list.push(m.member_id);
    memberIdsByInstitution.set(m.institution_id, list);
  }

  const facilityGroups: FacilityGroup[] = verifiedInst.map((institution) => ({
    institution,
    ownerEmail: emailById.get(institution.owner_id) ?? null,
    ownerRestricted: providerRestrictedById.get(institution.owner_id) ?? false,
    providers: (memberIdsByInstitution.get(institution.id) ?? []).map(providerSummary),
  }));

  // Any provider not an approved member of ANY facility.
  const affiliatedProviderIds = new Set(memberships.map((m) => m.member_id));
  const unaffiliatedProviders: ProviderSummary[] = providers
    .filter((p) => !affiliatedProviderIds.has(p.id))
    .map((p) => providerSummary(p.id));

  const pendingCount = pendingInst.length + pendingVer.length;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="beacon-rise mb-7">
        <span className="data-label text-primary-700">Administration</span>
        <h1 className="font-display mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground">
          <UserCheck className="size-7 text-primary" />
          Approvals
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review facilities and practitioners, browse who&apos;s affiliated
          with each facility, and restrict any account.
        </p>
      </header>

      <ApprovalsTabs
        pendingCount={pendingCount}
        pendingPanel={
          <ApprovalsPending
            institutions={pendingInst}
            institutionEmailById={emailById}
            institutionDocUrlById={institutionDocUrlById}
            verifications={pendingVer}
            verificationNameById={providerNameById}
            verificationEmailById={emailById}
            verificationDocUrlById={verificationDocUrlById}
            rosterMatchByLicense={rosterMatchByLicense}
          />
        }
        byFacilityPanel={<ApprovalsByFacility groups={facilityGroups} />}
        unaffiliatedPanel={<ApprovalsUnaffiliated providers={unaffiliatedProviders} />}
      />
    </div>
  );
}
