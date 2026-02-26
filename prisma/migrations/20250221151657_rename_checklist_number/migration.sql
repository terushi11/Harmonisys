/*
  Warnings:

  - You are about to drop the column `number` on the `Checklist` table. All the data in the column will be lost.
  - Added the required column `key` to the `Checklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checklist" DROP COLUMN "number",
ADD COLUMN     "key" INTEGER NOT NULL;
