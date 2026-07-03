import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
  className,
}: {
  variant?: "ghost" | "outline";
  className?: string;
}) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant={variant} size="sm" className={className}>
        <LogOut />
        Sign out
      </Button>
    </form>
  );
}
