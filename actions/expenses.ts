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
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "KASBON", "OTHER"]),
  date: z.date(),
  accountId: z.string().optional(),
  barberId: z.string().optional()
})

const updateExpenseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Judul harus diisi"),
  amount: z.string().min(1, "Jumlah harus diisi"),
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "KASBON", "OTHER"]),
  date: z.date(),
  accountId: z.string().optional()
})

const EXPENSE_PAGE_SIZE = 20

const getExpensesSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  category: z.enum(["RENT", "UTILITIES", "SUPPLIES", "KASBON", "OTHER"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(EXPENSE_PAGE_SIZE)
})

const convertExpenseToKasbonSchema = z.object({
  expenseId: z.string(),
  barberId: z.string()
})

export async function createExpense(params: z.infer<typeof createExpenseSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { title, amount, category, date, accountId, barberId } = createExpenseSchema.parse(params)

  try {
    if (category === "KASBON") {
      if (!barberId) {
        throw new Error("Barber wajib dipilih untuk kasbon")
      }
      if (!accountId) {
        throw new Error("Akun diperlukan untuk mencatat kasbon")
      }
    }

    const amountDecimal = new Decimal(amount)

    const expense = await prisma.$transaction(async (tx) => {
      let salaryDebtId: string | null = null

      if (category === "KASBON") {
        const debt = await tx.salaryDebt.create({
          data: {
            barberId: barberId!,
            amount: amountDecimal,
            reason: title,
            type: "KASBON"
          }
        })
        salaryDebtId = debt.id
      }

      const createdExpense = await tx.expense.create({
        data: {
          title,
          amount: amountDecimal,
          date,
          category,
          accountId: accountId || null,
          barberId: barberId || null,
          salaryDebtId
        },
        include: {
          barber: true
        }
      })

      if (accountId) {
        await tx.cashAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: amountDecimal } }
        })

        await tx.cashTransaction.create({
          data: {
            accountId,
            type: "WITHDRAW",
            amount: amountDecimal,
            description: `Pengeluaran: ${title}`
          }
        })
      }

      return createdExpense
    })

    revalidatePath("/owner/transactions")
    revalidatePath("/owner/cashflow")

    return {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.title,
      accountId: expense.accountId,
      barberId: expense.barberId,
      barberName: expense.barber?.name || null
    }
  } catch (error) {
    logError("Expenses", "Error creating expense", error)
    throw new Error("Gagal membuat pengeluaran")
  }
}

export async function convertExpenseToKasbon(params: z.infer<typeof convertExpenseToKasbonSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { expenseId, barberId } = convertExpenseToKasbonSchema.parse(params)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({
        where: { id: expenseId },
        select: {
          id: true,
          title: true,
          amount: true,
          date: true,
          category: true,
          accountId: true,
          salaryDebtId: true
        }
      })

      if (!expense) {
        throw new Error("Pengeluaran tidak ditemukan")
      }

      if (expense.salaryDebtId) {
        throw new Error("Pengeluaran ini sudah tertaut ke kasbon")
      }

      if (!expense.accountId) {
        throw new Error("Pengeluaran tanpa akun tidak bisa dikonversi menjadi kasbon")
      }

      const debt = await tx.salaryDebt.create({
        data: {
          barberId,
          amount: expense.amount,
          reason: expense.title,
          type: "KASBON"
        }
      })

      const updatedExpense = await tx.expense.update({
        where: { id: expense.id },
        data: {
          category: "KASBON",
          barberId,
          salaryDebtId: debt.id
        },
        include: {
          barber: true
        }
      })

      return {
        expense: updatedExpense,
        debtId: debt.id
      }
    })

    revalidatePath("/owner/transactions")
    revalidatePath("/owner/salaries")
    revalidatePath("/owner/cashflow")

    return {
      id: result.expense.id,
      date: result.expense.date,
      category: result.expense.category,
      amount: result.expense.amount.toString(),
      description: result.expense.title,
      accountId: result.expense.accountId,
      barberId: result.expense.barberId,
      barberName: result.expense.barber?.name || null,
      debtId: result.debtId
    }
  } catch (error) {
    logError("Expenses", "Error converting expense to kasbon", error)
    throw error instanceof Error ? error : new Error("Gagal mengkonversi pengeluaran menjadi kasbon")
  }
}

export async function updateExpense(params: z.infer<typeof updateExpenseSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, title, amount, category, date, accountId } = updateExpenseSchema.parse(params)

  try {
    if (category === "KASBON") {
      throw new Error("Gunakan aksi konversi untuk mengubah pengeluaran menjadi kasbon")
    }

    const existing = await prisma.expense.findUnique({
      where: { id },
      select: { category: true, salaryDebtId: true }
    })

    if (!existing) {
      throw new Error("Pengeluaran tidak ditemukan")
    }

    if (existing.category === "KASBON" || existing.salaryDebtId) {
      throw new Error("Kasbon tidak bisa diubah. Hapus dan buat ulang bila perlu.")
    }

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
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: { category: true, salaryDebtId: true }
    })

    if (!existing) {
      throw new Error("Pengeluaran tidak ditemukan")
    }

    if (existing.category === "KASBON" || existing.salaryDebtId) {
      throw new Error("Kasbon tidak bisa dihapus. Buat pembatalan terpisah bila diperlukan.")
    }

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

  const { startDate, endDate, category, search, page, pageSize } = getExpensesSchema.parse(params)

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

  const [expenses, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        account: true,
        barber: true
      },
      orderBy: {
        date: "desc"
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.expense.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    data: expenses.map(expense => ({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.title,
      accountId: expense.accountId,
      accountName: expense.account?.name,
      barberId: expense.barberId,
      barberName: expense.barber?.name,
      salaryDebtId: expense.salaryDebtId
    })),
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }
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
      KASBON: "Kasbon",
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
