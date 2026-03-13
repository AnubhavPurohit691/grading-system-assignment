"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signupAction } from "@/lib/actions/auth";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite")?.trim() ?? null;
  const isInviteFlow = Boolean(inviteToken);

  const [role, setRole] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteTeacherName, setInviteTeacherName] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(signupAction, {});

  useEffect(() => {
    if (state?.success) {
      router.replace("/dashboard");
    }
  }, [state?.success, router]);

  const effectiveRole: "TEACHER" | "STUDENT" = isInviteFlow ? "STUDENT" : role;

  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/invite/${encodeURIComponent(inviteToken)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string; teacherName?: string } | null) => {
        if (data?.email) setInviteEmail(data.email);
        if (data?.teacherName) setInviteTeacherName(data.teacherName);
      })
      .catch(() => {});
  }, [inviteToken]);

  return (
    <Card className="w-full max-w-md opacity-0 animate-fade-in-up">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl sm:text-2xl">Sign up</CardTitle>
        <CardDescription>
          {isInviteFlow && inviteTeacherName
            ? `Join ${inviteTeacherName}'s class. Create your account.`
            : "Create an account with email and role."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        {inviteToken && <input type="hidden" name="inviteToken" value={inviteToken} />}
        <CardContent className="space-y-4 pb-6">
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={isInviteFlow && inviteEmail ? inviteEmail : undefined}
              readOnly={isInviteFlow && !!inviteEmail}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          {!isInviteFlow && (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "TEACHER" | "STUDENT")}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} />
            </div>
          )}
          {isInviteFlow && <input type="hidden" name="role" value={effectiveRole} />}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-0">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="underline hover:text-foreground"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
