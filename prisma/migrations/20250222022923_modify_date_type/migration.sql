/*
  Warnings:

  - Made the column `date` on table `Unahon` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Unahon" ALTER COLUMN "date" SET NOT NULL;
