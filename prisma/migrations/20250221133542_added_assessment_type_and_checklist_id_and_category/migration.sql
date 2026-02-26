/*
  Warnings:

  - Added the required column `category` to the `Checklist` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Checklist` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `assessmentType` on the `Unahon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('INITIAL_ASSESSMENT', 'RE_ASSESSMENT');

-- DropIndex
DROP INDEX "Checklist_unahonId_key";

-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN     "category" INTEGER NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Unahon" DROP COLUMN "assessmentType",
ADD COLUMN     "assessmentType" "AssessmentType" NOT NULL;
