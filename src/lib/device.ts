import "server-only";
import { randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "beacon_device_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Reads this browser's device-id cookie, creating one if absent. Not a
 * security token — just an opaque per-browser identifier used to recognize
 * returning devices. Clearing cookies (or a private window) resets it, which
 * is an accepted limitation: this is a heads-up signal, not a checkpoint.
 */
async function deviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return id;
}

/**
 * Registers this browser against the account and reports whether it was
 * already known. The same device can legitimately be known for one account
 * and unknown for another (e.g. a shared clinic computer) — recognition is
 * scoped per-account, not global.
 *
 * Call on both signup and login: signup always reports isNewDevice=true
 * (nothing to compare against yet) and the caller should just register it
 * silently; login uses the result to decide whether to flag + alert.
 */
export async function recognizeDevice(
  userId: string,
): Promise<{ isNewDevice: boolean; deviceId: string }> {
  const id = await deviceId();
  const userAgent = (await headers()).get("user-agent");
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("known_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("device_id", id)
    .maybeSingle();

  if (existing) {
    await admin
      .from("known_devices")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);
    return { isNewDevice: false, deviceId: id };
  }

  await admin.from("known_devices").insert({
    user_id: userId,
    device_id: id,
    user_agent: userAgent,
  });
  return { isNewDevice: true, deviceId: id };
}
