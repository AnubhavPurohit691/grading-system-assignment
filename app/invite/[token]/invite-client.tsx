"use client";

import Link from "next/link";
import { Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  token: string;
  email: string;
  teacherName: string;
};

export function InviteClient({ token, email, teacherName }: Props) {
  const signupUrl = `/auth/signup?invite=${encodeURIComponent(token)}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-24 pb-12 sm:pt-40 sm:pb-20 px-4 grid-bg">
      <div className="landing-card w-full max-w-md space-y-6 text-center opacity-0 animate-fade-in-up">
        <div className="mx-auto flex size-14 items-center justify-center rounded-none bg-foreground text-background">
          <UserPlus className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">You&apos;re invited</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{teacherName}</span> invited you to join their class.
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            {email}
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={signupUrl}>Sign up with this email</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account? <Link href="/auth/login" className="underline hover:text-foreground">Log in</Link> and open this link again to join.
          </p>
        </div>
      </div>
    </div>
  );
}
