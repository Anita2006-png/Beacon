/**
 * Server bootstrap. Next.js runs `register()` once when the server starts.
 *
 * We force IPv4-first DNS resolution: on some networks (notably Windows dev
 * machines) Node's fetch/undici picks an IPv6 address Supabase publishes but
 * the local IPv6 route is broken, surfacing as an opaque "fetch failed" on
 * every auth/DB call. curl works because it falls back to IPv4 — this makes
 * Node do the same.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
