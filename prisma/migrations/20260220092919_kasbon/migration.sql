/*
  Warnings:

  - You are about to drop the column `paymentId` on the `SalaryDebt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[salaryDebtId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SalaryDebtType" AS ENUM ('KASBON', 'OTHER');

-- AlterEnum
ALTER TYPE "ExpenseCategory" ADD VALUE 'KASBON';

-- DropIndex
DROP INDEX "Expense_category_date_idx";

-- DropIndex
DROP INDEX "SalaryPeriod_barberId_isActive_key";

-- DropIndex
DROP INDEX "Transaction_date_barberId_idx";

-- DropIndex
DROP INDEX "TransactionItem_productId_idx";

-- DropIndex
DROP INDEX "TransactionItem_serviceId_idx";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "salaryDebtId" TEXT;

-- AlterTable
ALTER TABLE "SalaryDebt" DROP COLUMN "paymentId",
ADD COLUMN     "settledByPaymentId" TEXT,
ADD COLUMN     "type" "SalaryDebtType" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Barber_name_idx" ON "Barber"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_salaryDebtId_key" ON "Expense"("salaryDebtId");

-- CreateIndex
CREATE INDEX "Expense_barberId_idx" ON "Expense"("barberId");

-- CreateIndex
CREATE INDEX "Expense_salaryDebtId_idx" ON "Expense"("salaryDebtId");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_date_category_idx" ON "Expense"("date", "category");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

-- CreateIndex
CREATE INDEX "Transaction_paymentMethod_idx" ON "Transaction"("paymentMethod");

-- CreateIndex
CREATE INDEX "TransactionItem_type_serviceId_idx" ON "TransactionItem"("type", "serviceId");

-- CreateIndex
CREATE INDEX "TransactionItem_type_productId_idx" ON "TransactionItem"("type", "productId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_salaryDebtId_fkey" FOREIGN KEY ("salaryDebtId") REFERENCES "SalaryDebt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDebt" ADD CONSTRAINT "SalaryDebt_settledByPaymentId_fkey" FOREIGN KEY ("settledByPaymentId") REFERENCES "SalaryPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
