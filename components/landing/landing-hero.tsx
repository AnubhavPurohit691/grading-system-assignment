"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  UserCheck,
  Sparkles,
  Zap,
  Link2,
  ClipboardList,
  GraduationCap,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  user: { username: string; email: string } | null;
};

export function LandingHero({ user }: Props) {
  return (
    <div className="flex flex-col bg-background">
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 sm:pt-36 sm:pb-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
            Grade smarter,<br className="hidden sm:block" /> not harder
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            Create question papers, invite students, and let AI handle the grading. Get detailed report cards in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            {!user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto px-8">
                  <Link href="/auth/signup">
                    Get started
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8">
                  <Link href="/auth/login">Log in</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="px-8">
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="relative mt-14 w-full max-w-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl blur-2xl" />
            <div className="relative rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 border border-border/60">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Papers</p>
                    <p className="text-xs text-muted-foreground">Create & share</p>
                  </div>
                </div>
                <div className="hidden sm:block h-px sm:h-8 sm:w-px bg-border/80 flex-shrink-0" />
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 border border-border/60">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <UserCheck className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Students</p>
                    <p className="text-xs text-muted-foreground">Invite & attempt</p>
                  </div>
                </div>
                <div className="hidden sm:block h-px sm:h-8 sm:w-px bg-border/80 flex-shrink-0" />
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 border border-border/60">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">AI grades</p>
                    <p className="text-xs text-muted-foreground">Scores & reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Everything you need
            </h2>
            <p className="mt-3 text-muted-foreground">
              From creating papers to viewing report cards.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Zap, title: "AI-generated questions", desc: "Enter a topic, get MCQs and long-answer questions in seconds." },
              { icon: FileText, title: "MCQ & long form", desc: "Mix question types, set points, and mark correct answers." },
              { icon: Link2, title: "Invite links", desc: "Share a link or email invite so students join your class." },
              { icon: ClipboardList, title: "Report cards", desc: "Scores, letter grades, and per-question feedback for every submission." },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="size-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from paper creation to graded results.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px bg-border md:grid-cols-3">
            <div className="bg-background p-8">
              <span className="text-sm font-mono text-muted-foreground">01</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">Create papers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Build question papers with point values and expected answers. Share them with your students via invite links.
              </p>
            </div>

            <div className="bg-background p-8">
              <span className="text-sm font-mono text-muted-foreground">02</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">Students submit</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Students access their assigned papers and submit answers directly through the platform.
              </p>
            </div>

            <div className="bg-background p-8">
              <span className="text-sm font-mono text-muted-foreground">03</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">AI grades</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Submissions are evaluated automatically. You get scores, letter grades, and per-question feedback.
              </p>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            {!user ? (
              <Button asChild size="lg" className="px-8">
                <Link href="/auth/signup">
                  Get started
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="px-8">
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t border-border bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              For teachers and students
            </h2>
            <p className="mt-3 text-muted-foreground">
              One platform for creating assessments and taking them.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="size-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Teachers</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  Create and manage question papers
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  Generate questions from any topic with AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  Invite students via link or email
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  View all student report cards in one place
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Send className="size-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Students</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  See papers assigned by your teacher
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  Answer MCQs and long questions online
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  Submit in one go and get graded by AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground/40" />
                  View your report card with score and feedback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ready to save time?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your first paper or sign in to get started.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!user ? (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto px-8">
                    <Link href="/auth/signup">
                      Get started free
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8">
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="px-8">
                  <Link href="/dashboard">
                    Go to dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
