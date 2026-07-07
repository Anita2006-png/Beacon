import { Building2 } from "lucide-react";
import type { InstitutionRow } from "@/lib/database.types";
import { FACILITY_TYPES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestrictControl } from "@/components/admin/restrict-control";
import { ProviderSummaryRow, type ProviderSummary } from "@/components/admin/provider-summary-row";

const FACILITY_LABEL = new Map(FACILITY_TYPES.map((f) => [f.value, f.label]));

export interface FacilityGroup {
  institution: InstitutionRow;
  ownerEmail: string | null;
  ownerRestricted: boolean;
  providers: ProviderSummary[];
}

/** Every verified facility, with its approved staff nested underneath. */
export function ApprovalsByFacility({ groups }: { groups: FacilityGroup[] }) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-8 text-center text-sm text-muted-foreground">
          No verified facilities yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ institution, ownerEmail, ownerRestricted, providers }) => (
        <Card key={institution.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Building2 className="size-5" />
              </span>
              <div>
                <CardTitle>{institution.name}</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {FACILITY_LABEL.get(institution.facility_type) ?? institution.facility_type}
                  {" · "}
                  {ownerEmail ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ownerRestricted && <Badge variant="critical">Restricted</Badge>}
              <RestrictControl
                userId={institution.owner_id}
                name={institution.name}
                isRestricted={ownerRestricted}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {providers.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No affiliated staff yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {providers.map((p) => (
                  <ProviderSummaryRow key={p.userId} p={p} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
