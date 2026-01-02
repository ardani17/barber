/*
  Warnings:

  - Added the required column `password` to the `Barber` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

-- DropIndex
DROP INDEX "CashAccount_type_isDefault_key";

-- AlterTable
ALTER TABLE "Barber" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'temp123';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "accountId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "transactionNumber" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "type" "AttendanceType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attendance_barberId_idx" ON "Attendance"("barberId");

-- CreateIndex
CREATE INDEX "Attendance_timestamp_idx" ON "Attendance"("timestamp");

-- CreateIndex
CREATE INDEX "Expense_accountId_idx" ON "Expense"("accountId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
