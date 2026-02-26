-- DropForeignKey
ALTER TABLE "Checklist" DROP CONSTRAINT "Checklist_unahonId_fkey";

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_unahonId_fkey" FOREIGN KEY ("unahonId") REFERENCES "Unahon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
