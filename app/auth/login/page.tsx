import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Log in",
  description: "Sign in to your Grading.AI account.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 pt-24 pb-12 sm:pt-40 sm:pb-20 sm:px-6 grid-bg">
      <div className="absolute top-0 left-0 w-full h-px bg-foreground/10" />
      <LoginForm />
    </div>
  );
}
