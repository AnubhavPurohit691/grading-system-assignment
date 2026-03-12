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
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  user: { username: string; email: string } | null;
};

export function LandingHero({ user }: Props) {
  return (
    <div className="flex flex-col bg-background grid-bg min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 sm:pt-40 sm:pb-32 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
        
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-background/50 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Status: Operational</span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-7xl lg:text-8xl leading-[0.9] uppercase italic">
            Autonomous<br className="hidden sm:block" /> Evaluation
          </h1>
          
          <p className="mx-auto max-w-2xl text-sm font-medium text-muted-foreground uppercase tracking-wider leading-relaxed">
            Standardizing educational assessment through deterministic AI grading. Eliminate human bias. Maximize efficiency.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            {!user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto px-10 h-14 bg-foreground text-background hover:bg-muted-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95">
                  <Link href="/auth/signup">
                    Initialize Protocol
                    <ArrowRight className="ml-3 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-10 h-14 border-foreground hover:bg-foreground hover:text-background text-xs font-bold uppercase tracking-[0.2em] transition-all">
                  <Link href="/auth/login">Access Archive</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="px-10 h-14 bg-foreground text-background hover:bg-muted-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all">
                <Link href="/dashboard">
                  Enter Control Center
                  <ArrowRight className="ml-3 size-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="relative mt-20 w-full max-w-4xl border border-foreground/20 p-2 group overflow-hidden">
            <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative border border-foreground/10 bg-background p-4 sm:p-10 text-left">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                  <div className="flex flex-col gap-4 md:px-8">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Module 01</span>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Synthesis</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase leading-relaxed">Generate structured question papers from raw thematic data inputs.</p>
                  </div>
                  <div className="flex flex-col gap-4 md:px-8 border-y md:border-y-0 md:border-x border-border py-8 md:py-0">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Module 02</span>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Distribution</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase leading-relaxed">Secure encrypted invite links for student participant enrollment.</p>
                  </div>
                  <div className="flex flex-col gap-4 md:px-8">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Module 03</span>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">Evaluation</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase leading-relaxed">Neural processing of submissions with comprehensive reporting.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-border bg-foreground/[0.02]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4 block">Core Capabilities</span>
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                Technical Specifications
              </h2>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-xs text-right">
              Built for high-throughput educational environments and rigorous academic standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {[
              { icon: Zap, title: "Algorithmic Generation", desc: "AI-driven question synthesis across multiple domains." },
              { icon: ShieldCheck, title: "Verified Response", desc: "Rigorous MCQ and long-form answer validation." },
              { icon: Link2, title: "Encoded Access", desc: "Secure token-based invitation and enrollment system." },
              { icon: ClipboardList, title: "Diagnostic Data", desc: "Deep analytical feedback and performance metrics." },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-6 bg-background p-8 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight italic mb-2">{item.title}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 border-b border-border relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-border rounded-full opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-border rounded-full opacity-10 pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mb-6 block">Ready to deploy?</span>
            <h2 className="text-5xl font-black tracking-tighter text-foreground sm:text-7xl uppercase italic mb-10 leading-[0.9]">
              Begin Assessment<br />Cycle Now
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {!user ? (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto px-12 h-16 bg-foreground text-background hover:bg-muted-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all">
                    <Link href="/auth/signup">
                      Initialize Account
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-12 h-16 border-foreground hover:bg-foreground hover:text-background text-xs font-bold uppercase tracking-[0.2em] transition-all">
                    <Link href="/auth/login">User Login</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="px-12 h-16 bg-foreground text-background hover:bg-muted-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all">
                  <Link href="/dashboard">
                    Go to dashboard
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-foreground text-background text-[10px] font-black">G</div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Grading.AI / Evaluation Unit</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 Autonomous Educational Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

