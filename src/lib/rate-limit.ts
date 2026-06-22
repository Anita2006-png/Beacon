/**
 * Rate-limit seam (BUILD_SPEC §7.8).
 *
 * Deferred for the prototype: this is currently a no-op pass-through. The
 * emergency read path and the login action call `checkRateLimit()` so that a
 * real limiter (e.g. Upstash Redis sliding window) can be dropped in later by
 * editing ONLY this file — no call sites change.
 *
 * Documented as a known gap for the defence: token-guessing / brute-force
 * protection is designed-for but not yet enforced.
 */

export interface RateLimitResult {
  /** Whether the request is allowed through. Always true while deferred. */
  success: boolean;
  /** Remaining requests in the current window (Infinity while deferred). */
  remaining: number;
}

/**
 * @param _key   A stable identifier for the caller (e.g. `emergency:<ip>`).
 * @param _limit Max requests per window. Ignored while deferred.
 */
export async function checkRateLimit(
  _key: string,
  _limit = 10,
): Promise<RateLimitResult> {
  return { success: true, remaining: Number.POSITIVE_INFINITY };
}
