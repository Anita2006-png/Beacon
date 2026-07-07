import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { practitionerTypeLabel } from "@/lib/roles";
import type { PractitionerType } from "@/lib/database.types";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { RestrictControl } from "@/components/admin/restrict-control";

export interface ProviderSummary {
  userId: string;
  name: string | null;
  email: string | null;
  practitionerType: PractitionerType | null;
  council: string | null;
  licenseNumber: string | null;
  verificationStatus: "pending" | "verified" | "rejected" | null;
  isRestricted: boolean;
}

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  verified: "safe",
  pending: "caution",
  rejected: "critical",
};

function VerificationBadge({ status }: { status: ProviderSummary["verificationStatus"] }) {
  if (!status) return <Badge variant="muted">Not submitted</Badge>;
  const Icon = status === "verified" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      <Icon />
      {status}
    </Badge>
  );
}

/** One practitioner row, reused under a facility and in the unaffiliated list. */
export function ProviderSummaryRow({ p }: { p: ProviderSummary }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5">
      <div>
        <p className="font-medium text-foreground">{p.name ?? "Practitioner"}</p>
        <p className="tabular text-sm text-muted-foreground">{p.email ?? "—"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {p.practitionerType && (
          <span className="text-sm text-muted-foreground">
            {practitionerTypeLabel(p.practitionerType)}
          </span>
        )}
        {p.licenseNumber && (
          <span className="tabular text-sm text-muted-foreground">
            {p.council} {p.licenseNumber}
          </span>
        )}
        <VerificationBadge status={p.verificationStatus} />
        {p.isRestricted && <Badge variant="critical">Restricted</Badge>}
        <RestrictControl
          userId={p.userId}
          name={p.name ?? "this practitioner"}
          isRestricted={p.isRestricted}
        />
      </div>
    </li>
  );
}
