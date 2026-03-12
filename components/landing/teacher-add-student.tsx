"use client";

import { useState } from "react";
import { UserPlus, Link2, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Mode = "add" | "invite";

export function TeacherAddStudent() {
  const [mode, setMode] = useState<Mode>("invite");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function addExisting(e: React.FormEvent) {
    e.preventDefault();
    const val = email.trim();
    if (!val) {
      toast.error("Enter student email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Failed to add student");
        return;
      }
      toast.success(`Added ${data.student?.user?.email ?? val} as your student`);
      setEmail("");
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function createInvite(sendEmail: boolean) {
    const val = email.trim();
    if (!val) {
      toast.error("Enter student email");
      return;
    }
    setLoading(true);
    setInviteLink(null);
    try {
      const res = await fetch("/api/teacher/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: val, sendEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? (sendEmail ? "Failed to send invite" : "Failed to create invite"));
        return;
      }
      setInviteLink(data.invite?.inviteLink ?? null);
      if (sendEmail && data.emailSent) {
        toast.success(`Invite email sent to ${val}`);
      } else {
        toast.success(sendEmail ? "Invite link created. Copy and share it." : "Invite link created");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(
      () => {
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error("Could not copy")
    );
  }

  const activeClass = "bg-background text-foreground shadow-sm";
  const inactiveClass = "text-muted-foreground hover:text-foreground";

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("invite");
            setInviteLink(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${mode === "invite" ? activeClass : inactiveClass}`}
        >
          <Link2 className="size-4" />
          Send invite link
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("add");
            setInviteLink(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${mode === "add" ? activeClass : inactiveClass}`}
        >
          <UserPlus className="size-4" />
          Add existing student
        </button>
      </div>

      {mode === "invite" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createInvite(false);
          }}
          className="space-y-3"
        >
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Student email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="border-border focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading} className="gap-2">
              <Link2 className="size-4" />
              {loading ? "Creating…" : "Create invite link"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => createInvite(true)}
              className="gap-2"
            >
              <Mail className="size-4" />
              {loading ? "Sending…" : "Email link to student"}
            </Button>
          </div>
          {inviteLink && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 animate-fade-in">
              <p className="text-xs font-medium text-muted-foreground">One-time link (copy and share)</p>
              <div className="flex gap-2">
                <Input readOnly value={inviteLink} className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyLink} className="shrink-0">
                  {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={addExisting} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="student-email">Student email (must already have an account)</Label>
            <Input
              id="student-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="max-w-sm border-border focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-2 shrink-0">
            <UserPlus className="size-4" />
            {loading ? "Adding…" : "Add student"}
          </Button>
        </form>
      )}
    </div>
  );
}
