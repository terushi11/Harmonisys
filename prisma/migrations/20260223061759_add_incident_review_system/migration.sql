-- CreateEnum
CREATE TYPE "public"."IncidentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED');

-- AlterTable
ALTER TABLE "public"."Incident" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "public"."IncidentStatus" NOT NULL DEFAULT 'PENDING';
