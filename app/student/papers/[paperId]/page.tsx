import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudentIdFromCookies } from "@/lib/auth-server";
import { AttemptPaperClient } from "./attempt-paper-client";

type Props = { params: Promise<{ paperId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { paperId } = await params;
  return {
    title: "Attempt paper",
    description: `Attempt question paper`,
  };
}

export default async function AttemptPaperPage({ params }: Props) {
  const { paperId } = await params;
  const studentId = await getStudentIdFromCookies();
  if (!studentId) redirect("/auth/login");

  return <AttemptPaperClient paperId={paperId} />;
}
