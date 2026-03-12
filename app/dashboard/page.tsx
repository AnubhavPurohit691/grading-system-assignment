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
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="mb-16 border-l-4 border-foreground pl-6">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">
          {greeting} / Terminal Session Active
        </p>
        <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
          {user.username}
        </h1>
      </div>

      {teacherId ? (
        <div className="grid gap-8 sm:grid-cols-2">
          <Link
            href="/question-papers"
            className="group relative flex flex-col border border-foreground/10 bg-background p-8 transition-all hover:border-foreground"
          >
            <div className="absolute right-8 top-8 border border-foreground/10 p-3 transition-colors group-hover:bg-foreground group-hover:text-background">
              <FileText className="size-6" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Module 01</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-foreground mb-2">
              Papers Archive
            </h2>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground leading-relaxed max-w-xs">
              Interface for paper synthesis, question generation, and analytical reporting.
            </p>
            <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
              Initialize
              <ArrowRight className="size-3" />
            </div>
          </Link>

          <div className="flex flex-col border border-foreground/10 bg-background p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="border border-foreground/10 p-2">
                <UserPlus className="size-5 text-foreground" />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Module 02</span>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
                  Enrollment
                </h2>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground leading-relaxed mb-8">
              Protocol for student participant registration via encoded invite links.
            </p>
            <div className="mt-auto">
              <TeacherAddStudent />
            </div>
          </div>
        </div>
      ) : studentTeacher ? (
        <div className="max-w-2xl">
          <div className="border border-foreground bg-background p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 -rotate-45 translate-x-16 -translate-y-16" />
            <div className="flex flex-col sm:flex-row items-start gap-8 relative z-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-foreground bg-foreground text-background">
                <GraduationCap className="size-8" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Assigned Instructor</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-foreground">
                  {studentTeacher.user.username}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  {studentTeacher.user.email}
                </p>
                <div className="mt-10">
                   <Button asChild size="lg" className="gap-3 group">
                    <Link href="/student/papers">
                      <Sparkles className="size-4" />
                      Access Assessment Portal
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md border border-dashed border-foreground/30 bg-muted/20 p-12 text-center">
          <ShieldCheck className="mx-auto size-12 text-muted-foreground mb-6" />
          <h2 className="text-xl font-black uppercase tracking-tighter italic text-foreground">
            Awaiting Clearance
          </h2>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
            Authorized session for <span className="text-foreground">{user.email}</span> is active. 
            Awaiting instructor invitation for class enrollment.
          </p>
        </div>
      )}
    </div>
  );
}

