import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile, isApprovedProvider } from "@/lib/auth";
import { readEmergencyProfile } from "@/lib/emergency";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Programmatic emergency-access endpoint (BUILD_SPEC §7) — the privileged path
 * as a JSON API, mirroring the /e/[qr_token] page flow. Used by the test suite
 * and any non-browser client.
 *
 * Status contract (security test table §11):
 *   400 — missing token
 *   401 — not authenticated
 *   403 — authenticated but not an approved provider
 *   404 — unknown token (generic, no info leak)
 *   200 — minimal emergency view + audit log written
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  await checkRateLimit(`emergency-api:${token}`, 20);

  const session = await getCurrentProfile();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isApprovedProvider(session.profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const view = await readEmergencyProfile(token, session.user.id);
  if (!view) {
    // Same response shape for any unknown token.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(view, { status: 200 });
}
