import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-server";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2 py-12 text-center sm:py-16 lg:py-20">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <FileQuestion className="size-14 text-muted-foreground sm:size-16" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Grading
          </h1>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            Create question papers, add questions, and manage submissions in one
            place.
          </p>
        </div>
        {user ? (
          <div className="flex w-full max-w-xs flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {user.username}
              </span>
              .
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/question-papers">Go to question papers</Link>
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:max-w-md sm:gap-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
