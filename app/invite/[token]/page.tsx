import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InviteClient } from "./invite-client";

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await prisma.studentInvite.findUnique({
    where: { token },
    select: {
      email: true,
      expiresAt: true,
      usedAt: true,
      teacher: { select: { user: { select: { username: true } } } },
    },
  });

  if (
    !invite ||
    invite.usedAt ||
    invite.expiresAt < new Date()
  ) {
    notFound();
  }

  return (
    <InviteClient
      token={token}
      email={invite.email}
      teacherName={invite.teacher.user.username}
    />
  );
}
