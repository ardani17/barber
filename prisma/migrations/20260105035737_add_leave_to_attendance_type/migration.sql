-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('BONUS', 'DEDUCTION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceType" ADD VALUE 'PERMISSION';
ALTER TYPE "AttendanceType" ADD VALUE 'SICK';
ALTER TYPE "AttendanceType" ADD VALUE 'LEAVE';

-- DropForeignKey
ALTER TABLE "CashTransaction" DROP CONSTRAINT "CashTransaction_accountId_fkey";

-- AlterTable
ALTER TABLE "CashTransaction" ALTER COLUMN "accountId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "baseSalaryAmount" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "bonusAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "cashAmount" DECIMAL(10,2) NOT NULL,
    "bankAmount" DECIMAL(10,2) NOT NULL,
    "qrisAmount" DECIMAL(10,2) NOT NULL,
    "cashAccountId" TEXT,
    "bankAccountId" TEXT,
    "qrisAccountId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryDebt" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "SalaryDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAdjustment" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryPeriod" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalaryPayment_barberId_idx" ON "SalaryPayment"("barberId");

-- CreateIndex
CREATE INDEX "SalaryPayment_paymentDate_idx" ON "SalaryPayment"("paymentDate");

-- CreateIndex
CREATE INDEX "SalaryPayment_periodStart_periodEnd_idx" ON "SalaryPayment"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SalaryDebt_barberId_idx" ON "SalaryDebt"("barberId");

-- CreateIndex
CREATE INDEX "SalaryDebt_isPaid_idx" ON "SalaryDebt"("isPaid");

-- CreateIndex
CREATE INDEX "SalaryAdjustment_barberId_idx" ON "SalaryAdjustment"("barberId");

-- CreateIndex
CREATE INDEX "SalaryAdjustment_periodStart_periodEnd_idx" ON "SalaryAdjustment"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SalaryAdjustment_type_idx" ON "SalaryAdjustment"("type");

-- CreateIndex
CREATE INDEX "SalaryPeriod_barberId_idx" ON "SalaryPeriod"("barberId");

-- CreateIndex
CREATE INDEX "SalaryPeriod_isActive_idx" ON "SalaryPeriod"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryPeriod_barberId_isActive_key" ON "SalaryPeriod"("barberId", "isActive");

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_qrisAccountId_fkey" FOREIGN KEY ("qrisAccountId") REFERENCES "CashAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryDebt" ADD CONSTRAINT "SalaryDebt_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustment" ADD CONSTRAINT "SalaryAdjustment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryPeriod" ADD CONSTRAINT "SalaryPeriod_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
