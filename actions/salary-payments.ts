"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getBarberSalaryReport } from "./barbers"

const dateSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value)
  }
  return value
}, z.date())

const normalizeDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const getExpectedMonthlyEndDate = (startDate: Date) => {
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  const day = startDate.getDate()
  const nextMonthSameDay = new Date(year, month + 1, day)
  if (nextMonthSameDay.getDate() !== day) {
    return new Date(year, month + 2, 0)
  }
  const expectedEnd = new Date(nextMonthSameDay)
  expectedEnd.setDate(expectedEnd.getDate() - 1)
  return expectedEnd
}

const isMonthlyPeriod = (startDate: Date, endDate: Date) => {
  const start = normalizeDate(startDate)
  const end = normalizeDate(endDate)
  if (end < start) {
    return false
  }
  const expectedEnd = normalizeDate(getExpectedMonthlyEndDate(start))
  return expectedEnd.getTime() === end.getTime()
}

const paySalarySchema = z.object({
  barberId: z.string(),
  periodStart: dateSchema,
  periodEnd: dateSchema,
  tunaiAmount: z.string(),
  bankAmount: z.string(),
  qrisAmount: z.string(),
  tunaiAccountId: z.string().optional(),
  bankAccountId: z.string().optional(),
  qrisAccountId: z.string().optional(),
  bonusAmount: z.string().optional(),
  deductionAmount: z.string().optional(),
  notes: z.string().optional()
})

const addDebtSchema = z.object({
  barberId: z.string(),
  amount: z.string(),
  reason: z.string()
})

const addAdjustmentSchema = z.object({
  barberId: z.string(),
  periodStart: dateSchema,
  periodEnd: dateSchema,
  type: z.enum(["BONUS", "DEDUCTION"]),
  amount: z.string(),
  reason: z.string()
})

const payDebtSchema = z.object({
  debtId: z.string(),
  cashAmount: z.string(),
  qrisAmount: z.string(),
  cashAccountId: z.string().optional(),
  qrisAccountId: z.string().optional()
})

const createSalaryPeriodSchema = z.object({
  barberId: z.string(),
  name: z.string(),
  startDate: dateSchema,
  endDate: dateSchema
}).refine(async (data) => {
  const barber = await prisma.barber.findUnique({
    where: { id: data.barberId },
    select: { baseSalary: true }
  })
  
  if (barber?.baseSalary && !barber.baseSalary.equals(new Decimal(0))) {
    return isMonthlyPeriod(data.startDate, data.endDate)
  }
  
  return true
}, {
  message: "Untuk barber dengan gaji pokok, periode harus tepat 1 bulan"
})

const updateSalaryPeriodSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: dateSchema,
  endDate: dateSchema
})

export async function paySalary(params: z.infer<typeof paySalarySchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const {
    barberId,
    periodStart,
    periodEnd,
    tunaiAmount,
    bankAmount,
    qrisAmount,
    tunaiAccountId,
    bankAccountId,
    qrisAccountId,
    bonusAmount,
    deductionAmount,
    notes
  } = paySalarySchema.parse(params)

  const tunaiAmountDecimal = new Decimal(tunaiAmount || "0")
  const bankAmountDecimal = new Decimal(bankAmount || "0")
  const qrisAmountDecimal = new Decimal(qrisAmount || "0")
  const bonusAmountDecimal = new Decimal(bonusAmount || "0")
  const deductionAmountDecimal = new Decimal(deductionAmount || "0")
  const totalPaymentDecimal = tunaiAmountDecimal.plus(bankAmountDecimal).plus(qrisAmountDecimal)

  if (totalPaymentDecimal.lte(0)) {
    throw new Error("Total pembayaran harus lebih dari 0")
  }

  try {
    const salaryReport = await getBarberSalaryReport(barberId, periodStart, periodEnd)

    const adjustments = await prisma.salaryAdjustment.findMany({
      where: {
        barberId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart }
      }
    })

    let existingBonus = new Decimal(0)
    let existingDeduction = new Decimal(0)

    adjustments.forEach(adj => {
      if (adj.type === "BONUS") {
        existingBonus = existingBonus.plus(adj.amount)
      } else {
        existingDeduction = existingDeduction.plus(adj.amount)
      }
    })

    const totalBonus = existingBonus.plus(bonusAmountDecimal)
    const totalDeduction = existingDeduction.plus(deductionAmountDecimal)

    if (tunaiAmountDecimal.gt(0) && !tunaiAccountId) {
      throw new Error("Akun tunai diperlukan untuk pembayaran tunai")
    }

    if (bankAmountDecimal.gt(0) && !bankAccountId) {
      throw new Error("Akun bank diperlukan untuk pembayaran bank")
    }

    if (qrisAmountDecimal.gt(0) && !qrisAccountId) {
      throw new Error("Akun QRIS diperlukan untuk pembayaran QRIS")
    }

    const tunaiAccount = tunaiAccountId ? await prisma.cashAccount.findUnique({
      where: { id: tunaiAccountId }
    }) : null

    const bankAccount = bankAccountId ? await prisma.cashAccount.findUnique({
      where: { id: bankAccountId }
    }) : null

    const qrisAccount = qrisAccountId ? await prisma.cashAccount.findUnique({
      where: { id: qrisAccountId }
    }) : null

    if (tunaiAccountId && !tunaiAccount) {
      throw new Error("Akun tunai tidak ditemukan")
    }

    if (bankAccountId && !bankAccount) {
      throw new Error("Akun bank tidak ditemukan")
    }

    if (qrisAccountId && !qrisAccount) {
      throw new Error("Akun QRIS tidak ditemukan")
    }

    if (tunaiAccount && tunaiAmountDecimal.gt(0) && new Decimal(tunaiAccount.balance).lt(tunaiAmountDecimal)) {
      throw new Error(`Saldo akun tunai ${tunaiAccount.name} tidak mencukupi. Saldo: ${tunaiAccount.balance}, Diperlukan: ${tunaiAmountDecimal}`)
    }

    if (bankAccount && bankAmountDecimal.gt(0) && new Decimal(bankAccount.balance).lt(bankAmountDecimal)) {
      throw new Error(`Saldo akun bank ${bankAccount.name} tidak mencukupi. Saldo: ${bankAccount.balance}, Diperlukan: ${bankAmountDecimal}`)
    }

    if (qrisAccount && qrisAmountDecimal.gt(0) && new Decimal(qrisAccount.balance).lt(qrisAmountDecimal)) {
      throw new Error(`Saldo akun QRIS ${qrisAccount.name} tidak mencukupi. Saldo: ${qrisAccount.balance}, Diperlukan: ${qrisAmountDecimal}`)
    }

    if (tunaiAccount && tunaiAmountDecimal.gt(0)) {
      await prisma.cashAccount.update({
        where: { id: tunaiAccountId },
        data: { balance: { decrement: tunaiAmountDecimal } }
      })

      await prisma.cashTransaction.create({
        data: {
          accountId: tunaiAccountId,
          type: "WITHDRAW",
          amount: tunaiAmountDecimal,
          description: `Pembayaran gaji ${salaryReport.barberName} periode ${periodStart.toISOString().split("T")[0]} - ${periodEnd.toISOString().split("T")[0]}`
        }
      })
    }

    if (bankAccount && bankAmountDecimal.gt(0)) {
      await prisma.cashAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: bankAmountDecimal } }
      })

      await prisma.cashTransaction.create({
        data: {
          accountId: bankAccountId,
          type: "WITHDRAW",
          amount: bankAmountDecimal,
          description: `Pembayaran gaji ${salaryReport.barberName} periode ${periodStart.toISOString().split("T")[0]} - ${periodEnd.toISOString().split("T")[0]}`
        }
      })
    }

    if (qrisAccount && qrisAmountDecimal.gt(0)) {
      await prisma.cashAccount.update({
        where: { id: qrisAccountId },
        data: { balance: { decrement: qrisAmountDecimal } }
      })

      await prisma.cashTransaction.create({
        data: {
          accountId: qrisAccountId,
          type: "WITHDRAW",
          amount: qrisAmountDecimal,
          description: `Pembayaran gaji ${salaryReport.barberName} periode ${periodStart.toISOString().split("T")[0]} - ${periodEnd.toISOString().split("T")[0]}`
        }
      })
    }

    const payment = await prisma.salaryPayment.create({
      data: {
        barberId,
        periodStart,
        periodEnd,
        baseSalaryAmount: salaryReport.baseSalary || "0",
        commissionAmount: salaryReport.totalCommission,
        bonusAmount: totalBonus,
        deductionAmount: totalDeduction,
        totalAmount: totalPaymentDecimal,
        cashAmount: tunaiAmountDecimal,
        bankAmount: bankAmountDecimal,
        qrisAmount: qrisAmountDecimal,
        cashAccountId: tunaiAmountDecimal.gt(0) ? tunaiAccountId : null,
        bankAccountId: bankAmountDecimal.gt(0) ? bankAccountId : null,
        qrisAccountId: qrisAmountDecimal.gt(0) ? qrisAccountId : null,
        notes
      }
    })

    revalidatePath("/owner/salaries")
    revalidatePath("/owner/cashflow")

    return {
      id: payment.id,
      barberId: payment.barberId,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      totalAmount: payment.totalAmount.toString(),
      cashAmount: payment.cashAmount.toString(),
      qrisAmount: payment.qrisAmount.toString(),
      paymentDate: payment.paymentDate
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Gagal membayar gaji")
  }
}

export async function getSalaryPayments(barberId?: string, startDate?: Date, endDate?: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const where: any = {}

    if (barberId) {
      where.barberId = barberId
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: startDate,
        lte: endDate
      }
    }

    const payments = await prisma.salaryPayment.findMany({
      where,
      include: {
        barber: true,
        cashAccount: true,
        qrisAccount: true
      },
      orderBy: {
        paymentDate: "desc"
      }
    })

    return payments.map(payment => ({
      id: payment.id,
      barberId: payment.barberId,
      barberName: payment.barber.name,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      baseSalaryAmount: payment.baseSalaryAmount.toString(),
      commissionAmount: payment.commissionAmount.toString(),
      bonusAmount: payment.bonusAmount.toString(),
      deductionAmount: payment.deductionAmount.toString(),
      totalAmount: payment.totalAmount.toString(),
      cashAmount: payment.cashAmount.toString(),
      qrisAmount: payment.qrisAmount.toString(),
      cashAccountName: payment.cashAccount?.name || null,
      qrisAccountName: payment.qrisAccount?.name || null,
      paymentDate: payment.paymentDate,
      notes: payment.notes
    }))
  } catch (error) {
    throw new Error("Gagal mengambil data pembayaran gaji")
  }
}

export async function addSalaryDebt(params: z.infer<typeof addDebtSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { barberId, amount, reason } = addDebtSchema.parse(params)

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    })

    if (!barber) {
      throw new Error("Barber tidak ditemukan")
    }

    const debt = await prisma.salaryDebt.create({
      data: {
        barberId,
        amount: new Decimal(amount),
        reason
      }
    })

    revalidatePath("/owner/salaries")

    return {
      id: debt.id,
      barberId: debt.barberId,
      barberName: barber.name,
      amount: debt.amount.toString(),
      reason: debt.reason,
      isPaid: debt.isPaid,
      createdAt: debt.createdAt
    }
  } catch (error) {
    throw new Error("Gagal menambahkan hutang gaji")
  }
}

export async function getSalaryDebts(barberId?: string, showPaid: boolean = false) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const where: any = {}

    if (barberId) {
      where.barberId = barberId
    }

    if (!showPaid) {
      where.isPaid = false
    }

    const debts = await prisma.salaryDebt.findMany({
      where,
      include: {
        barber: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return debts.map(debt => ({
      id: debt.id,
      barberId: debt.barberId,
      barberName: debt.barber.name,
      amount: debt.amount.toString(),
      reason: debt.reason,
      isPaid: debt.isPaid,
      paidDate: debt.paidAt,
      createdAt: debt.createdAt
    }))
  } catch (error) {
    throw new Error("Gagal mengambil data hutang gaji")
  }
}

export async function paySalaryDebt(params: z.infer<typeof payDebtSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { debtId, cashAmount, qrisAmount, cashAccountId, qrisAccountId } = payDebtSchema.parse(params)

  const cashAmountDecimal = new Decimal(cashAmount)
  const qrisAmountDecimal = new Decimal(qrisAmount)
  const totalAmountDecimal = cashAmountDecimal.plus(qrisAmountDecimal)

  if (totalAmountDecimal.lte(0)) {
    throw new Error("Total pembayaran harus lebih dari 0")
  }

  try {
    const debt = await prisma.salaryDebt.findUnique({
      where: { id: debtId },
      include: {
        barber: true
      }
    })

    if (!debt) {
      throw new Error("Hutang tidak ditemukan")
    }

    if (debt.isPaid) {
      throw new Error("Hutang ini sudah dibayar")
    }

    if (!new Decimal(debt.amount).equals(totalAmountDecimal)) {
      throw new Error(`Jumlah pembayaran tidak sesuai. Diharapkan: ${debt.amount.toString()}, Diberikan: ${totalAmountDecimal.toString()}`)
    }

    if (cashAmountDecimal.gt(0) && !cashAccountId) {
      throw new Error("Cash account ID diperlukan untuk pembayaran tunai")
    }

    if (qrisAmountDecimal.gt(0) && !qrisAccountId) {
      throw new Error("QRIS account ID diperlukan untuk pembayaran QRIS")
    }

    const cashAccount = cashAccountId ? await prisma.cashAccount.findUnique({
      where: { id: cashAccountId }
    }) : null

    const qrisAccount = qrisAccountId ? await prisma.cashAccount.findUnique({
      where: { id: qrisAccountId }
    }) : null

    if (cashAccountId && !cashAccount) {
      throw new Error("Cash account tidak ditemukan")
    }

    if (qrisAccountId && !qrisAccount) {
      throw new Error("QRIS account tidak ditemukan")
    }

    if (cashAccount && cashAmountDecimal.gt(0) && new Decimal(cashAccount.balance).lt(cashAmountDecimal)) {
      throw new Error(`Saldo cash account ${cashAccount.name} tidak mencukupi`)
    }

    if (qrisAccount && qrisAmountDecimal.gt(0) && new Decimal(qrisAccount.balance).lt(qrisAmountDecimal)) {
      throw new Error(`Saldo QRIS account ${qrisAccount.name} tidak mencukupi`)
    }

    if (cashAccount && cashAmountDecimal.gt(0)) {
      await prisma.cashAccount.update({
        where: { id: cashAccountId },
        data: { balance: { decrement: cashAmountDecimal } }
      })

      await prisma.cashTransaction.create({
        data: {
          accountId: cashAccountId,
          type: "WITHDRAW",
          amount: cashAmountDecimal,
          description: `Pembayaran hutang gaji ${debt.barber.name} - ${debt.reason}`
        }
      })
    }

    if (qrisAccount && qrisAmountDecimal.gt(0)) {
      await prisma.cashAccount.update({
        where: { id: qrisAccountId },
        data: { balance: { decrement: qrisAmountDecimal } }
      })

      await prisma.cashTransaction.create({
        data: {
          accountId: qrisAccountId,
          type: "WITHDRAW",
          amount: qrisAmountDecimal,
          description: `Pembayaran hutang gaji ${debt.barber.name} - ${debt.reason}`
        }
      })
    }

    const updatedDebt = await prisma.salaryDebt.update({
      where: { id: debtId },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    })

    revalidatePath("/owner/salaries")
    revalidatePath("/owner/cashflow")

    return {
      id: updatedDebt.id,
      barberId: updatedDebt.barberId,
      amount: updatedDebt.amount.toString(),
      isPaid: updatedDebt.isPaid,
      paidAt: updatedDebt.paidAt
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Gagal membayar hutang gaji")
  }
}

export async function addSalaryAdjustment(params: z.infer<typeof addAdjustmentSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { barberId, periodStart, periodEnd, type, amount, reason } = addAdjustmentSchema.parse(params)

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    })

    if (!barber) {
      throw new Error("Barber tidak ditemukan")
    }

    const adjustment = await prisma.salaryAdjustment.create({
      data: {
        barberId,
        periodStart,
        periodEnd,
        type,
        amount: new Decimal(amount),
        reason
      }
    })

    revalidatePath("/owner/salaries")

    return {
      id: adjustment.id,
      barberId: adjustment.barberId,
      barberName: barber.name,
      periodStart: adjustment.periodStart,
      periodEnd: adjustment.periodEnd,
      type: adjustment.type,
      amount: adjustment.amount.toString(),
      reason: adjustment.reason,
      createdAt: adjustment.createdAt
    }
  } catch (error) {
    throw new Error("Gagal menambahkan penyesuaian gaji")
  }
}

export async function getSalaryAdjustments(barberId?: string, periodStart?: Date, periodEnd?: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const where: any = {}

    if (barberId) {
      where.barberId = barberId
    }

    if (periodStart && periodEnd) {
      where.AND = [
        { periodStart: { lte: periodEnd } },
        { periodEnd: { gte: periodStart } }
      ]
    }

    const adjustments = await prisma.salaryAdjustment.findMany({
      where,
      include: {
        barber: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return adjustments.map(adjustment => ({
      id: adjustment.id,
      barberId: adjustment.barberId,
      barberName: adjustment.barber.name,
      periodStart: adjustment.periodStart,
      periodEnd: adjustment.periodEnd,
      type: adjustment.type,
      amount: adjustment.amount.toString(),
      reason: adjustment.reason,
      createdAt: adjustment.createdAt
    }))
  } catch (error) {
    throw new Error("Gagal mengambil data penyesuaian gaji")
  }
}

export async function deleteSalaryAdjustment(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.salaryAdjustment.delete({
      where: { id }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw new Error("Gagal menghapus penyesuaian gaji")
  }
}

export async function getCashAccounts() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const accounts = await prisma.cashAccount.findMany({
      orderBy: {
        name: "asc"
      }
    })

    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString()
    }))
  } catch (error) {
    throw new Error("Gagal mengambil data akun kas")
  }
}

export async function getPeriodSalaryDetail(barberId: string, periodStart: Date, periodEnd: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId }
    })

    if (!barber) {
      throw new Error("Barber tidak ditemukan")
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        barberId,
        date: {
          gte: periodStart,
          lte: periodEnd
        }
      }
    })

    const adjustments = await prisma.salaryAdjustment.findMany({
      where: {
        barberId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart }
      }
    })

    let totalCommission = new Decimal(0)
    let transactionCount = 0

    transactions.forEach(t => {
      totalCommission = totalCommission.plus(t.totalCommission)
      transactionCount++
    })

    let totalBonus = new Decimal(0)
    let totalDeduction = new Decimal(0)

    adjustments.forEach(adj => {
      if (adj.type === "BONUS") {
        totalBonus = totalBonus.plus(adj.amount)
      } else {
        totalDeduction = totalDeduction.plus(adj.amount)
      }
    })

    const baseSalary = barber.baseSalary || new Decimal(0)

    const totalShouldPay = baseSalary.plus(totalCommission).plus(totalBonus).minus(totalDeduction)

    return {
      barberId,
      barberName: barber.name,
      compensationType: barber.compensationType,
      baseSalary: baseSalary.toString(),
      commissionAmount: totalCommission.toString(),
      transactionCount,
      bonusAmount: totalBonus.toString(),
      deductionAmount: totalDeduction.toString(),
      totalShouldPay: totalShouldPay.toString()
    }
  } catch (error) {
    throw new Error("Gagal mengambil rincian gaji periode")
  }
}

export async function createSalaryPeriod(params: z.infer<typeof createSalaryPeriodSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const validatedParams = await createSalaryPeriodSchema.parseAsync(params)
    
    const barber = await prisma.barber.findUnique({
      where: { id: validatedParams.barberId }
    })
    
    if (!barber) {
      throw new Error("Barber tidak ditemukan")
    }
    
    const existingPeriod = await prisma.salaryPeriod.findFirst({
      where: {
        barberId: validatedParams.barberId,
        isActive: true
      }
    })
    
    if (existingPeriod) {
      await prisma.salaryPeriod.update({
        where: { id: existingPeriod.id },
        data: { isActive: false }
      })
    }
    
    await prisma.salaryPeriod.create({
      data: {
        barberId: validatedParams.barberId,
        name: validatedParams.name,
        startDate: validatedParams.startDate,
        endDate: validatedParams.endDate
      }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Gagal membuat periode gaji")
  }
}

export async function updateSalaryPeriod(params: z.infer<typeof updateSalaryPeriodSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.salaryPeriod.update({
      where: { id: params.id },
      data: {
        name: params.name,
        startDate: params.startDate,
        endDate: params.endDate
      }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw new Error("Gagal mengupdate periode gaji")
  }
}

export async function deleteSalaryPeriod(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.salaryPeriod.delete({
      where: { id }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw new Error("Gagal menghapus periode gaji")
  }
}

export async function deactivateSalaryPeriod(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.salaryPeriod.update({
      where: { id },
      data: { isActive: false }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw new Error("Gagal menonaktifkan periode gaji")
  }
}

export async function activateSalaryPeriod(id: string, barberId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const existingActivePeriod = await prisma.salaryPeriod.findFirst({
      where: {
        barberId,
        isActive: true
      }
    })

    if (existingActivePeriod) {
      await prisma.salaryPeriod.update({
        where: { id: existingActivePeriod.id },
        data: { isActive: false }
      })
    }

    await prisma.salaryPeriod.update({
      where: { id },
      data: { isActive: true }
    })

    revalidatePath("/owner/salaries")

    return { success: true }
  } catch (error) {
    throw new Error("Gagal mengaktifkan periode gaji")
  }
}

export async function getSalaryPeriods(barberId?: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const periods = await prisma.salaryPeriod.findMany({
      where: barberId ? {
        barberId
      } : undefined,
      include: {
        barber: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return periods.map(period => ({
      id: period.id,
      barberId: period.barberId,
      barberName: period.barber.name,
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: period.isActive,
      createdAt: period.createdAt,
      updatedAt: period.updatedAt
    }))
  } catch (error) {
    throw new Error("Gagal mengambil data periode gaji")
  }
}

export async function getActiveSalaryPeriod(barberId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const period = await prisma.salaryPeriod.findFirst({
      where: {
        barberId,
        isActive: true
      }
    })

    return period
  } catch (error) {
    throw new Error("Gagal mengambil data periode gaji aktif")
  }
}
