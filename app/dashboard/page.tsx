import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getTeacherIdFromCookies, getStudentTeacher } from "@/lib/auth-server";
import { TeacherAddStudent } from "@/components/landing/teacher-add-student";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage question papers or access your assigned papers.",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const teacherId = await getTeacherIdFromCookies();
  const studentTeacher = await getStudentTeacher();
  const greeting = getGreeting();

  return (
    <div className="min-h-[60vh]">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {greeting}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {user.username}
        </h1>
      </div>

      {teacherId ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/question-papers"
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md"
          >
            <div className="absolute right-4 top-4 rounded-full bg-foreground/5 p-2 transition-colors group-hover:bg-foreground/10">
              <FileText className="size-5 text-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground pr-12">
              Question papers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create papers, add or generate questions, and view student reports.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <UserPlus className="size-4 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Add students
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Send an invite link or add by email to your class.
            </p>
            <div className="mt-6 flex-1">
              <TeacherAddStudent />
            </div>
          </div>
        </div>
      ) : studentTeacher ? (
        <div className="max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="size-6 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Your teacher
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {studentTeacher.user.username}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {studentTeacher.user.email}
                </p>
                <Button asChild size="lg" className="mt-6 gap-2" variant="default">
                  <Link href="/student/papers">
                    <Sparkles className="size-4" />
                    My papers
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <ShieldCheck className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Awaiting invite
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You’re signed in as <span className="font-medium text-foreground">{user.email}</span>.
            Ask your teacher to send you an invite link to join their class.
          </p>
        </div>
      )}
    </div>
  );
}
