-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'RESPONDER', 'NORMAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserType" NOT NULL DEFAULT 'NORMAL';
