import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
}: {
  variant?: "ghost" | "outline";
}) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant={variant} size="sm">
        <LogOut />
        Sign out
      </Button>
    </form>
  );
}
