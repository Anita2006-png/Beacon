"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, LogIn, Monitor, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { rejectDevice, type RejectDeviceState } from "@/app/security/actions";
import type { AuthEventRow, KnownDeviceRow } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function RejectButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="critical" disabled={pending}>
      <ShieldOff />
      {pending ? "Rejecting…" : "This wasn't me"}
    </Button>
  );
}

function RejectDeviceForm({ deviceRowId }: { deviceRowId: string }) {
  const [state, formAction] = useActionState<RejectDeviceState, FormData>(
    rejectDevice,
    {},
  );
  const notified = useRef(false);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok && !notified.current) {
      notified.current = true;
      toast.success("Device forgotten. Signed out everywhere else.");
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="deviceRowId" value={deviceRowId} />
      <RejectButton />
    </form>
  );
}

/**
 * The account owner's own login history + known devices. Recognition and
 * event logging happen server-side at signin/signup — this is a read + a
 * single "reject" action (forget the device, sign out every other session).
 */
export function RecentSignIns({
  events,
  devices,
  currentDeviceId,
}: {
  events: AuthEventRow[];
  devices: KnownDeviceRow[];
  currentDeviceId: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Known devices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {devices.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No devices recorded yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {devices.map((d) => {
                const isCurrent = d.device_id === currentDeviceId;
                return (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
                        <Monitor className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {d.user_agent ?? "Unknown browser"}
                          {isCurrent && (
                            <span className="ml-2">
                              <Badge variant="info">This device</Badge>
                            </span>
                          )}
                        </p>
                        <p className="tabular text-sm text-muted-foreground">
                          Last used {formatWhen(d.last_seen_at)} · first seen{" "}
                          {formatWhen(d.first_seen_at)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && <RejectDeviceForm deviceRowId={d.id} />}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sign-ins</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No sign-ins recorded yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5"
                >
                  <div className="flex items-center gap-2">
                    {e.event_type === "signup" ? (
                      <Badge variant="info">
                        <UserPlus />
                        Signup
                      </Badge>
                    ) : (
                      <Badge variant="muted">
                        <LogIn />
                        Login
                      </Badge>
                    )}
                    {e.new_device && (
                      <Badge variant="caution">
                        <AlertTriangle />
                        New device
                      </Badge>
                    )}
                  </div>
                  <span className="tabular text-sm text-muted-foreground">
                    {formatWhen(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
