import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InviteClient } from "./invite-client";

type Props = { params: Promise<{ token: string }> };

const getInvite = cache(async (token: string) => {
  return prisma.studentInvite.findUnique({
    where: { token },
    select: {
      email: true,
      expiresAt: true,
      usedAt: true,
      teacher: { select: { user: { select: { username: true } } } },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite || invite.usedAt || invite.expiresAt < new Date())
    return { title: "Invite" };
  return { title: `Join ${invite.teacher.user.username}'s class`, description: "You're invited to join a class." };
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInvite(token);

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
