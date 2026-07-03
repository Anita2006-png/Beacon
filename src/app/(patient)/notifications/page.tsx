import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/patient/notifications-list";

/**
 * In-app notifications (BUILD_SPEC §7). Every privileged access to a patient's
 * record already writes an `access_logs` row; this page reframes those events as
 * a patient-facing alert feed (RLS scopes the query to the signed-in patient).
 * Anything in the last 7 days is flagged "New".
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("access_logs")
    .select("id, access_type, created_at, accessor_name, note")
    .order("created_at", { ascending: false });

  const rows = logs ?? [];
  const unread = rows.filter(
    (r) => Date.now() - new Date(r.created_at).getTime() < SEVEN_DAYS,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="beacon-rise">
        <span className="data-label text-primary-700">Stay informed</span>
        <h1 className="font-display mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight">
          Notifications
          {unread > 0 && (
            <span className="inline-grid min-w-6 place-items-center rounded-full bg-primary px-2 py-0.5 text-sm font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You&apos;re alerted whenever someone accesses your medical record.
        </p>
      </header>

      <NotificationsList rows={rows} />
    </div>
  );
}
