import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { LandingHero } from "@/components/landing/landing-hero";

export const metadata: Metadata = {
  title: "Grading.AI",
  description: "Create question papers, invite students, and get AI grading with report cards.",
};

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <LandingHero
      user={null}
    />
  );
}
