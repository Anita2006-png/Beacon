import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/database.types";
import type { User } from "@supabase/supabase-js";

/** The verified user (via getUser) or null. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The verified user paired with their profiles row, or null if not signed in. */
export async function getCurrentProfile(): Promise<
  { user: User; profile: ProfileRow } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile ? { user, profile } : null;
}

/** True only for a signed-in provider whose account is approved. */
export function isApprovedProvider(profile: ProfileRow | null | undefined): boolean {
  return profile?.role === "provider" && profile.provider_status === "approved";
}
