import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Sign up — Grading",
  description: "Create a Grading account.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:px-6">
      <SignupForm />
    </div>
  );
}
