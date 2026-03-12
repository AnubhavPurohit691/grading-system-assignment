import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTeacherIdFromCookies } from "@/lib/auth-server";
import { ReportCardClient } from "@/app/student/report/[submissionId]/report-card-client";

type Props = {
  params: Promise<{ paperId: string; submissionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { submissionId } = await params;
  return {
    title: `Report — Grading`,
    description: `View student report`,
  };
}

export default async function TeacherReportCardPage({ params }: Props) {
  const { paperId, submissionId } = await params;
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  return (
    <ReportCardClient
      submissionId={submissionId}
      backLink={{
        href: `/question-papers/${paperId}`,
        label: "Back to paper",
      }}
    />
  );
}
