/*
  Warnings:

  - A unique constraint covering the columns `[type,isDefault]` on the table `CashAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CashAccount" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CashAccount_type_isDefault_key" ON "CashAccount"("type", "isDefault");
