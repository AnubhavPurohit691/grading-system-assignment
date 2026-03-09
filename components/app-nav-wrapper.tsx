import { cookies } from "next/headers";
import { AppNav } from "@/components/app-nav";

export async function AppNavWrapper() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gradingtoken")?.value;
  let user: { username: string; email: string } | null = null;
  if (token) {
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const res = await fetch(`${base}/api/auth/me`, {
        headers: { cookie: `gradingtoken=${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user
          ? { username: data.user.username, email: data.user.email }
          : null;
      }
    } catch {
      user = null;
    }
  }
  return <AppNav user={user} />;
}
