import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudentIdFromCookies } from "@/lib/auth-server";
import { ReportCardClient } from "./report-card-client";

type Props = { params: Promise<{ submissionId: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
title: "Report card",
  description: "Your grading report",
  };
}

export default async function ReportCardPage({ params }: Props) {
  const { submissionId } = await params;
  const studentId = await getStudentIdFromCookies();
  if (!studentId) redirect("/auth/login");

  return <ReportCardClient submissionId={submissionId} />;
}
