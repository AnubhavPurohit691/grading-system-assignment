"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AppNav({
  user,
}: {
  user: { username: string; email: string; role?: string } | null;
}) {
  const pathname = usePathname();
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl transition-all h-16">
      <div className="container flex h-full items-center justify-between gap-4">
        <nav className="flex min-w-0 flex-1 items-center gap-6 sm:gap-10">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl font-bold text-foreground transition-transform hover:scale-[1.02]"
          >
            <div className="relative flex h-8 w-8 items-center justify-center bg-background rounded-none border border-border overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-fuchsia-500 animate-gradient-xy opacity-20 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="size-4 text-foreground relative z-10 group-hover:text-background transition-colors" />
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground group-hover:from-cyan-600 group-hover:to-fuchsia-600 dark:group-hover:from-cyan-400 dark:group-hover:to-fuchsia-400 bg-clip-text group-hover:text-transparent transition-all duration-300">
              Grading.AI
            </span>
          </Link>
          
          <div className="hidden sm:flex items-center gap-6">
            {user && (
               <Link
                href="/dashboard"
                className={cn(
                  "relative text-sm font-semibold transition-colors hover:text-foreground flex items-center gap-2 px-3 py-2 rounded-none",
                  pathname === "/dashboard"
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            )}
            {isTeacher && (
              <Link
                href="/question-papers"
                className={cn(
                  "relative text-sm font-semibold transition-colors hover:text-foreground flex items-center gap-2 px-3 py-2 rounded-none",
                  pathname?.startsWith("/question-papers")
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="size-4" />
                Question papers
              </Link>
            )}
            {isStudent && (
              <Link
                href="/student/papers"
                className={cn(
                  "relative text-sm font-semibold transition-colors hover:text-foreground flex items-center gap-2 px-3 py-2 rounded-none",
                  pathname?.startsWith("/student") 
                    ? "text-foreground bg-muted" 
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="size-4" />
                Assessment Portal
              </Link>
            )}
          </div>
        </nav>
        
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-border bg-background hover:bg-muted transition-all rounded-none h-9">
                  <div className="flex size-5 items-center justify-center bg-foreground text-[10px] font-bold text-background rounded-none">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-medium">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-background shadow-lg p-2 rounded-none">
                <div className="px-2 py-3 text-sm flex flex-col gap-1 border-b border-border/50 mb-2">
                  <span className="font-bold text-foreground">{user.username}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground rounded-none">
                  <a href="/api/auth/logout" className="flex w-full items-center gap-2 py-2">
                    <LogOut className="size-4" />
                    Secure Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex hover:bg-muted font-semibold text-muted-foreground hover:text-foreground rounded-none">
                <Link href="/auth/login">Login</Link>
              </Button>
              <div className="relative group/btn inline-block">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 animate-gradient-xy opacity-0 group-hover/btn:opacity-100 transition-opacity blur-sm" />
                <Button size="sm" asChild className="relative bg-foreground text-background hover:bg-background hover:text-foreground font-bold px-6 border border-foreground transition-all rounded-none ring-0 focus-visible:ring-0">
                  <Link href="/auth/signup">Get Access</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
