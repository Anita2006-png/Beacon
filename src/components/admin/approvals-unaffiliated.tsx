import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderSummaryRow, type ProviderSummary } from "@/components/admin/provider-summary-row";

/** Providers who aren't an approved member of any facility — independent
 *  practitioners and anyone who hasn't found/joined one yet, at any
 *  verification status. */
export function ApprovalsUnaffiliated({ providers }: { providers: ProviderSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not affiliated with any facility</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {providers.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            Every provider is affiliated with a facility.
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
  );
}
