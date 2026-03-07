/*
  Warnings:

  - The values [ORGANIZATION,SOLO_TEACHER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `classId` on the `question_paper` table. All the data in the column will be lost.
  - You are about to drop the column `soloTeacherId` on the `question_paper` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `question_paper` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `soloTeacherId` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the `_ClassToSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClassToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentToSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubjectToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solo_teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LetterGrade" AS ENUM ('E', 'A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_PLUS', 'D', 'F');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('TEACHER', 'STUDENT');
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_ClassToSubject" DROP CONSTRAINT "_ClassToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToSubject" DROP CONSTRAINT "_ClassToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToTeacher" DROP CONSTRAINT "_ClassToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToTeacher" DROP CONSTRAINT "_ClassToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToSubject" DROP CONSTRAINT "_StudentToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToSubject" DROP CONSTRAINT "_StudentToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToTeacher" DROP CONSTRAINT "_StudentToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToTeacher" DROP CONSTRAINT "_StudentToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_soloTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_userId_fkey";

-- DropForeignKey
ALTER TABLE "question_paper" DROP CONSTRAINT "question_paper_classId_fkey";

-- DropForeignKey
ALTER TABLE "question_paper" DROP CONSTRAINT "question_paper_soloTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "question_paper" DROP CONSTRAINT "question_paper_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "solo_teacher" DROP CONSTRAINT "solo_teacher_userId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_classId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_soloTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_userId_fkey";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "subject_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "subject_soloTeacherId_fkey";

-- DropForeignKey
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_userId_fkey";

-- DropIndex
DROP INDEX "question_paper_soloTeacherId_idx";

-- DropIndex
DROP INDEX "question_paper_subjectId_classId_idx";

-- AlterTable
ALTER TABLE "question_paper" DROP COLUMN "classId",
DROP COLUMN "soloTeacherId",
DROP COLUMN "subjectId";

-- AlterTable
ALTER TABLE "student" DROP COLUMN "classId",
DROP COLUMN "organizationId",
DROP COLUMN "soloTeacherId",
ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "letterGrade" "LetterGrade";

-- AlterTable
ALTER TABLE "teacher" DROP COLUMN "organizationId";

-- DropTable
DROP TABLE "_ClassToSubject";

-- DropTable
DROP TABLE "_ClassToTeacher";

-- DropTable
DROP TABLE "_StudentToSubject";

-- DropTable
DROP TABLE "_StudentToTeacher";

-- DropTable
DROP TABLE "_SubjectToTeacher";

-- DropTable
DROP TABLE "class";

-- DropTable
DROP TABLE "organization";

-- DropTable
DROP TABLE "solo_teacher";

-- DropTable
DROP TABLE "subject";

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
