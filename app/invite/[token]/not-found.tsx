import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InviteNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-muted-foreground">
        This invite link is invalid, expired, or has already been used.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
