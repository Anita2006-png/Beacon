import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Count of auth_events newer than this admin's last visit to /admin/auth-log.
 * Before their first-ever visit there's no bookmark row, so we report 0
 * rather than every historical event (which wouldn't read as "new").
 */
export async function getNewAuthEventCount(adminUserId: string): Promise<number> {
  const admin = createAdminClient();

  const { data: view } = await admin
    .from("admin_auth_log_views")
    .select("last_viewed_at")
    .eq("admin_user_id", adminUserId)
    .maybeSingle();

  if (!view) return 0;

  const { count } = await admin
    .from("auth_events")
    .select("*", { count: "exact", head: true })
    .gt("created_at", view.last_viewed_at);

  return count ?? 0;
}

/** Bookmarks "now" as this admin's last visit — resets their badge to 0. */
export async function markAuthLogViewed(adminUserId: string): Promise<void> {
  try {
    await createAdminClient()
      .from("admin_auth_log_views")
      .upsert({ admin_user_id: adminUserId, last_viewed_at: new Date().toISOString() });
  } catch {
    // Never let bookmark-writing break the page.
  }
}
