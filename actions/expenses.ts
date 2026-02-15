"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"
import { revalidatePath } from "next/cache"
import { logError } from "@/lib/logger"

const createExpenseSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  amount: z.string().min(1, "Jumlah harus diisi"),
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "OTHER"]),
  date: z.date(),
  accountId: z.string().optional()
})

const updateExpenseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Judul harus diisi"),
  amount: z.string().min(1, "Jumlah harus diisi"),
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "OTHER"]),
  date: z.date(),
  accountId: z.string().optional()
})

const getExpensesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "OTHER"]).optional(),
  search: z.string().optional()
})

export async function createExpense(params: z.infer<typeof createExpenseSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { title, amount, category, date, accountId } = createExpenseSchema.parse(params)

  try {
    const expenseData: any = {
      title,
      amount: new Decimal(amount),
      date,
      category
    }

    if (accountId) {
      expenseData.accountId = accountId
    }

    const expense = await prisma.expense.create({
      data: expenseData
    })

    if (accountId) {
      await prisma.$transaction([
        prisma.cashAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: new Decimal(amount) } }
        }),
        prisma.cashTransaction.create({
          data: {
            accountId,
            type: "WITHDRAW",
            amount: new Decimal(amount),
            description: `Pengeluaran: ${title}`
          }
        })
      ])
    }

    revalidatePath("/owner/transactions")
    revalidatePath("/owner/cashflow")

    return {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.title,
      accountId: expense.accountId
    }
  } catch (error) {
    logError("Expenses", "Error creating expense", error)
    throw new Error("Gagal membuat pengeluaran")
  }
}

export async function updateExpense(params: z.infer<typeof updateExpenseSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, title, amount, category, date, accountId } = updateExpenseSchema.parse(params)

  try {
    const expenseData: any = {
      title,
      amount: new Decimal(amount),
      date,
      category
    }

    if (accountId !== undefined) {
      expenseData.accountId = accountId || null
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: expenseData
    })

    revalidatePath("/owner/transactions")

    return {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.title,
      accountId: expense.accountId
    }
  } catch (error) {
    logError("Expenses", "Error updating expense", error)
    throw new Error("Gagal mengupdate pengeluaran")
  }
}

export async function deleteExpense(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.expense.delete({
      where: { id }
    })

    revalidatePath("/owner/transactions")

    return { success: true }
  } catch (error) {
    logError("Expenses", "Gagal menghapus pengeluaran", error)
    throw new Error("Gagal menghapus pengeluaran")
  }
}

export async function getExpenses(params: z.infer<typeof getExpensesSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { startDate, endDate, category, search } = getExpensesSchema.parse(params)

  const where: any = {
    date: {
      gte: startDate,
      lte: endDate
    }
  }

  if (category) {
    where.category = category
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } }
    ]
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      account: true
    },
    orderBy: {
      date: "desc"
    }
  })

  return expenses.map(expense => ({
    id: expense.id,
    date: expense.date,
    category: expense.category,
    amount: expense.amount.toString(),
    description: expense.title,
    accountId: expense.accountId,
    accountName: expense.account?.name
  }))
}

export async function getExpensesByCategory(startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    })

    const categoryLabels: Record<string, string> = {
      RENT: "Sewa Kontrakan",
      UTILITIES: "Utilitas",
      SUPPLIES: "Perlengkapan",
      OTHER: "Lainnya"
    }

    return expenses.map(expense => ({
      category: expense.category,
      categoryLabel: categoryLabels[expense.category] || expense.category,
      totalAmount: expense._sum.amount?.toString() || "0",
      count: expense._count
    })).sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount))
  } catch (error) {
    logError("Expenses", "Error fetching expenses by category", error)
    throw new Error("Gagal mengambil data pengeluaran per kategori")
  }
}
