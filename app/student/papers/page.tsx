import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStudentIdFromCookies } from "@/lib/auth-server";
import { StudentPapersClient } from "./student-papers-client";

export const metadata: Metadata = {
  title: "My papers",
  description: "Question papers from your teacher",
};

export default async function StudentPapersPage() {
  const studentId = await getStudentIdFromCookies();
  if (!studentId) redirect("/auth/login");

  return <StudentPapersClient />;
}
