/*
  Warnings:

  - Made the column `competency` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "competency" SET NOT NULL,
ALTER COLUMN "competency" SET DEFAULT 1;
