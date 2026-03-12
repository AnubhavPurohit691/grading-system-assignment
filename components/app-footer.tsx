import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

const GITHUB_URL = "https://github.com/AnubhavPurohit691";
const LINKEDIN_URL = "https://www.linkedin.com/in/anubhav-purohit-11a53b29a/";

export function AppFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:gap-4">
        <span>Built by AnubhavPurohit</span>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <div className="flex items-center gap-4">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            aria-label="GitHub profile"
          >
            <Github className="size-4" />
            GitHub
          </Link>
          <Link
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            aria-label="LinkedIn profile"
          >
            <Linkedin className="size-4" />
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
