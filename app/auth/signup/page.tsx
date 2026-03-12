import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Sign up",
  description: "Create a Grading.AI account.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 pt-24 pb-12 sm:pt-40 sm:pb-20 sm:px-6 grid-bg">
      <div className="absolute top-0 left-0 w-full h-px bg-foreground/10" />
      <SignupForm />
    </div>
  );
}
