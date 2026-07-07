"use client";

import { useState } from "react";
import { Building2, Clock, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "pending" | "by-facility" | "unaffiliated";

/**
 * Tab switch for the combined approvals page. Each panel is rendered
 * server-side and passed in as already-built JSX (not raw data) — a Server
 * Component's *output* can cross into a Client Component as children, but
 * the Map objects that built it can't, so this stays a plain node/slot
 * pattern rather than re-fetching or re-shaping anything client-side.
 */
export function ApprovalsTabs({
  pendingCount,
  pendingPanel,
  byFacilityPanel,
  unaffiliatedPanel,
}: {
  pendingCount: number;
  pendingPanel: React.ReactNode;
  byFacilityPanel: React.ReactNode;
  unaffiliatedPanel: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(pendingCount > 0 ? "pending" : "by-facility");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === "pending" ? "default" : "outline"}
          onClick={() => setTab("pending")}
        >
          <Clock className="size-4" />
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "by-facility" ? "default" : "outline"}
          onClick={() => setTab("by-facility")}
        >
          <Building2 className="size-4" />
          By facility
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "unaffiliated" ? "default" : "outline"}
          onClick={() => setTab("unaffiliated")}
        >
          <UserX className="size-4" />
          Unaffiliated
        </Button>
      </div>

      {tab === "pending" && pendingPanel}
      {tab === "by-facility" && byFacilityPanel}
      {tab === "unaffiliated" && unaffiliatedPanel}
    </div>
  );
}
