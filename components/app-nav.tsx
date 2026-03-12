"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Sparkles, Terminal } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all h-14">
      <div className="container flex h-full items-center justify-between gap-4">
        <nav className="flex min-w-0 flex-1 items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-bold text-foreground transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center bg-foreground text-background border border-foreground transition-all group-hover:bg-background group-hover:text-foreground">
              <Terminal className="size-4" />
            </div>
            <span className="font-bold tracking-tighter uppercase">
              Grading.AI
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {user && (
               <Link
                href="/dashboard"
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 border-b-2",
                  pathname === "/dashboard"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                Dashboard
              </Link>
            )}
            {isTeacher && (
              <Link
                href="/question-papers"
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 border-b-2",
                  pathname?.startsWith("/question-papers")
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                Papers
              </Link>
            )}
            {isStudent && (
              <Link
                href="/student/papers"
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 border-b-2",
                  pathname?.startsWith("/student") 
                    ? "border-foreground text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                Assessments
              </Link>
            )}
          </div>
        </nav>
        
        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 border border-border hover:bg-muted transition-all h-8 px-2">
                  <div className="flex size-5 items-center justify-center bg-foreground text-[10px] font-bold text-background uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border-foreground bg-background p-1 shadow-2xl">
                <div className="px-3 py-2 text-[10px] uppercase tracking-tighter border-b border-border mb-1">
                  <p className="font-bold text-foreground leading-none mb-1">{user.username}</p>
                  <p className="text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-foreground focus:text-background text-xs font-bold uppercase py-2">
                  <a href="/api/auth/logout" className="flex w-full items-center gap-2">
                    <LogOut className="size-3" />
                    Terminate Session
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:bg-muted h-8">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-foreground text-background hover:bg-muted-foreground text-xs font-bold uppercase tracking-widest px-4 h-8 transition-all active:scale-95">
                <Link href="/auth/signup">Get Access</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

