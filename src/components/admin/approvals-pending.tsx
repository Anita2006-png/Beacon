import { CheckCircle2, ExternalLink } from "lucide-react";
import type { InstitutionRow, ProviderVerificationRow } from "@/lib/database.types";
import { practitionerTypeLabel } from "@/lib/roles";
import { FACILITY_TYPES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InstitutionReview } from "@/components/admin/institution-review";
import { VerificationReview } from "@/components/admin/verification-review";

const FACILITY_LABEL = new Map(FACILITY_TYPES.map((f) => [f.value, f.label]));

function checkSummary(result: unknown): {
  label: string;
  variant: "safe" | "caution" | "muted";
} {
  const r = result as { ok?: boolean; format_valid?: boolean } | null;
  if (!r || typeof r !== "object") {
    return { label: "No check on file", variant: "muted" };
  }
  if (r.ok) return { label: "Registry match", variant: "safe" };
  if (r.format_valid) {
    return { label: "Format OK · no registry match", variant: "caution" };
  }
  return { label: "Invalid format", variant: "caution" };
}

/** The two pending-review queues (facilities + practitioners), combined into
 *  one "needs your attention now" section. */
export function ApprovalsPending({
  institutions,
  institutionEmailById,
  institutionDocUrlById,
  verifications,
  verificationNameById,
  verificationEmailById,
  verificationDocUrlById,
  rosterMatchByLicense,
}: {
  institutions: InstitutionRow[];
  institutionEmailById: Map<string, string>;
  institutionDocUrlById: Map<string, string | null>;
  verifications: ProviderVerificationRow[];
  verificationNameById: Map<string, string | null>;
  verificationEmailById: Map<string, string>;
  verificationDocUrlById: Map<string, string | null>;
  rosterMatchByLicense: Map<string, string[]>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending facilities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {institutions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No facilities are waiting for review.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Registry IDs</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.map((i) => {
                  const summary = checkSummary(i.verify_check_result);
                  const url = institutionDocUrlById.get(i.id) ?? null;
                  return (
                    <TableRow key={i.id}>
                      <TableCell>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {FACILITY_LABEL.get(i.facility_type) ?? i.facility_type}
                        </div>
                        <div className="tabular text-sm text-muted-foreground">
                          {institutionEmailById.get(i.owner_id) ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="tabular text-sm">
                        <div className="flex flex-col gap-0.5">
                          {i.nhfr_code && <span>NHFR: {i.nhfr_code}</span>}
                          {i.state_moh_reg_no && <span>MoH: {i.state_moh_reg_no}</span>}
                          {i.cac_rc_number && <span>CAC: {i.cac_rc_number}</span>}
                          {!i.nhfr_code && !i.state_moh_reg_no && !i.cac_rc_number && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={summary.variant}>{summary.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            View document
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <InstitutionReview institutionId={i.id} name={i.name} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending practitioners</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {verifications.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No licenses are waiting for review.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Practitioner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((v) => {
                  const url = verificationDocUrlById.get(v.id) ?? null;
                  const name = verificationNameById.get(v.provider_id) ?? "Practitioner";
                  const rosterMatches = rosterMatchByLicense.get(
                    v.license_number.trim().toUpperCase(),
                  );
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="font-medium">{name}</div>
                        <div className="tabular text-sm text-muted-foreground">
                          {verificationEmailById.get(v.provider_id) ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{practitionerTypeLabel(v.practitioner_type)}</div>
                        <div className="text-muted-foreground">{v.council}</div>
                      </TableCell>
                      <TableCell className="tabular">
                        <div>{v.license_number}</div>
                        {rosterMatches && rosterMatches.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-safe">
                            <CheckCircle2 className="size-3.5" />
                            Matches roster at {rosterMatches.join(", ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            View document
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <VerificationReview providerId={v.provider_id} name={name} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
