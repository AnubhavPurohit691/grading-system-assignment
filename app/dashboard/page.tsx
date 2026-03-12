import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getTeacherIdFromCookies, getStudentTeacher } from "@/lib/auth-server";
import { TeacherAddStudent } from "@/components/landing/teacher-add-student";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, UserPlus, ShieldCheck, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Grading",
  description: "Manage question papers or access your assigned papers.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const teacherId = await getTeacherIdFromCookies();
  const studentTeacher = await getStudentTeacher();

  return (
    <div className="flex flex-col items-center py-10 bg-background relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-500/5 via-teal-500/5 to-transparent pointer-events-none -z-10 animate-gradient-xy" />
      <div className="w-full max-w-4xl space-y-8 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-left bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dashboard
        </h1>
        
        {teacherId ? (
          <div>
            <div className="relative bg-card p-1 shadow-sm overflow-hidden rounded-none group hover:shadow-xl transition-all duration-500 border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-teal-500/20 to-cyan-500/30 animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col gap-6 bg-background p-7 border border-background h-full">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent animate-gradient-text font-extrabold">{user.username}</span>.
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Your question papers are ready.</p>
                </div>
                
                <div className="space-y-4 border border-border bg-muted/20 p-5 rounded-none group/add">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserPlus className="size-4 text-blue-500 group-hover/add:scale-110 transition-transform" />
                    Expand your classroom
                  </p>
                  <TeacherAddStudent />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="relative group/btn w-full sm:flex-1">
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 animate-gradient-xy opacity-70 group-hover/btn:opacity-100 transition-opacity blur-md" />
                    <Button asChild size="lg" className="relative w-full gap-2 bg-background text-foreground hover:bg-background rounded-none shadow-none border border-border/50 transition-transform group-hover/btn:scale-[1.02]">
                      <Link href="/question-papers">
                        <GraduationCap className="size-5 text-teal-500" />
                        <span className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent animate-gradient-text font-bold">Manage Question Papers</span>
                        <ChevronRight className="size-4 text-teal-500 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all ml-auto sm:ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : studentTeacher ? (
          <div>
            <div className="relative border border-border bg-card p-1 shadow-sm rounded-none group hover:shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/30 animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-background p-7 z-10 flex flex-col border border-background gap-4">
                <h2 className="text-xl font-semibold text-foreground relative z-10">
                  Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent animate-gradient-text font-extrabold">{user.username}</span>.
                </h2>
                <div className="border border-border bg-muted/10 p-6 relative overflow-hidden group/inner rounded-none z-10">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
                    <GraduationCap className="size-4 text-emerald-500" /> Assigned Classroom
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {studentTeacher.user.username}'s Class
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {studentTeacher.user.email}
                  </p>
                  <div className="relative group/btn w-full mt-2">
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 animate-gradient-xy opacity-70 group-hover/btn:opacity-100 transition-opacity blur-sm" />
                    <Button asChild className="relative w-full gap-2 bg-background text-foreground hover:bg-background transition-transform active:scale-95 group-hover/btn:scale-[1.02] rounded-none shadow-none border border-border/50" size="lg">
                      <Link href="/student/papers">
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent animate-gradient-text font-bold">Enter Assessment Portal</span>
                        <ChevronRight className="size-4 text-teal-500 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative border border-border bg-muted p-8 shadow-sm text-center rounded-none group overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500/50 to-orange-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <ShieldCheck className="mx-auto size-12 text-foreground mb-4 opacity-50 group-hover:animate-pulse group-hover:text-amber-500 transition-colors" />
              <h2 className="text-xl font-semibold text-foreground">Awaiting Link</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                You’re registered as <span className="font-medium text-foreground">{user.email}</span> but not linked to a teacher yet. Request your teacher to send an invite link.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
