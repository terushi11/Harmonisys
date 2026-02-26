-- CreateTable
CREATE TABLE "Unahon" (
    "id" TEXT NOT NULL,
    "assessmentType" BOOLEAN NOT NULL,
    "client" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unahon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "agree" BOOLEAN NOT NULL DEFAULT false,
    "disagree" BOOLEAN NOT NULL DEFAULT false,
    "unahonId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_unahonId_key" ON "Checklist"("unahonId");

-- AddForeignKey
ALTER TABLE "Unahon" ADD CONSTRAINT "Unahon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_unahonId_fkey" FOREIGN KEY ("unahonId") REFERENCES "Unahon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
