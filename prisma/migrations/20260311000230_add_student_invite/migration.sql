-- CreateTable
CREATE TABLE "student_invite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_invite_token_key" ON "student_invite"("token");

-- CreateIndex
CREATE INDEX "student_invite_teacherId_idx" ON "student_invite"("teacherId");

-- CreateIndex
CREATE INDEX "student_invite_token_idx" ON "student_invite"("token");

-- AddForeignKey
ALTER TABLE "student_invite" ADD CONSTRAINT "student_invite_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
