/*
  Warnings:

  - Added the required column `updatedAt` to the `RoleChangeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."RequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "public"."RoleChangeRequest"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- CreateIndex
CREATE INDEX "RoleChangeRequest_userId_idx" ON "public"."RoleChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "RoleChangeRequest_status_idx" ON "public"."RoleChangeRequest"("status");
