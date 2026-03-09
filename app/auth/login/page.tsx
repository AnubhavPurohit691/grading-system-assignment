import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Log in — Grading",
  description: "Sign in to your Grading account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:px-6">
      <LoginForm />
    </div>
  );
}
