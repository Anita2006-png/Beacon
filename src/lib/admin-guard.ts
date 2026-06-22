import "server-only";
import { getSessionUser } from "@/lib/auth";

/** Admin allowlist from ADMIN_EMAILS (comma-separated), lower-cased. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the signed-in user's email is in the allowlist. */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  const email = user?.email?.toLowerCase();
  return Boolean(email && adminEmails().includes(email));
}

/** Throws "FORBIDDEN" unless the caller is an allowlisted admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("FORBIDDEN");
  }
}
