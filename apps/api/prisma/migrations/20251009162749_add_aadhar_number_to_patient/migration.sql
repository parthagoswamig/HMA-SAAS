/*
  Warnings:

  - A unique constraint covering the columns `[aadharNumber]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "aadharNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patients_aadharNumber_key" ON "patients"("aadharNumber");
