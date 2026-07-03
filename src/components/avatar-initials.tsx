function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

/** A small initials avatar — used in dashboard greetings across all roles. */
export function AvatarInitials({
  name,
  className = "",
}: {
  name: string | null;
  className?: string;
}) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-primary-foreground ${className}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
