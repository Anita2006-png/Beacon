"use client";

import { useState } from "react";
import { Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordSearch } from "@/components/admin/record-actions";
import { ProviderRecordSearch } from "@/components/admin/provider-record-search";

/** Account-type switch for "Find a record": patients vs. doctors/nurses. */
export function FindRecord() {
  const [accountType, setAccountType] = useState<"patient" | "provider">("patient");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={accountType === "patient" ? "default" : "outline"}
          onClick={() => setAccountType("patient")}
        >
          <UserRound className="size-4" />
          Patient
        </Button>
        <Button
          type="button"
          size="sm"
          variant={accountType === "provider" ? "default" : "outline"}
          onClick={() => setAccountType("provider")}
        >
          <Stethoscope className="size-4" />
          Doctor or nurse
        </Button>
      </div>

      {accountType === "patient" ? <RecordSearch /> : <ProviderRecordSearch />}
    </div>
  );
}
