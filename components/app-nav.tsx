"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileQuestion, LayoutDashboard, LogOut, User } from "lucide-react";
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
  user: { username: string; email: string } | null;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <nav className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <FileQuestion className="size-6" />
            <span className="hidden sm:inline">Grading</span>
          </Link>
          {user && (
            <Link
              href="/question-papers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname?.startsWith("/question-papers")
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="size-4" />
                Papers
              </span>
            </Link>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="size-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user.email}
                </div>
                <DropdownMenuItem asChild>
                  <a href="/api/auth/logout" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
