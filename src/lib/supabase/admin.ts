import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Privileged Supabase client using the SECRET key — bypasses RLS.
 *
 * Used ONLY by the privileged server paths: the emergency read + log write
 * (BUILD_SPEC §7) and the admin approval flow (§6). The `server-only` import
 * makes the build fail if this module is ever pulled into client code.
 *
 * Construct per request; never cache at module scope.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
