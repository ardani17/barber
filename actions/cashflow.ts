"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"
import { revalidatePath } from "next/cache"

const createAccountSchema = z.object({
  name: z.string().min(1, "Nama akun harus diisi"),
  type: z.enum(["TUNAI", "BANK", "QRIS"]),
  initialBalance: z.string(),
  accountNumber: z.string().optional()
})

const updateAccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama akun harus diisi"),
  type: z.enum(["TUNAI", "BANK", "QRIS"]),
  accountNumber: z.string().optional()
})

const transactionSchema = z.object({
  accountId: z.string(),
  type: z.enum(["DEPOSIT", "WITHDRAW"]),
  amount: z.string(),
  description: z.string()
})

const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.string(),
  description: z.string()
})

export async function createCashAccount(params: z.infer<typeof createAccountSchema> & { isDefault?: boolean }) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { name, type, initialBalance, accountNumber, isDefault } = params

  try {
    const account = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.cashAccount.updateMany({
          where: { type, isDefault: true },
          data: { isDefault: false }
        })
      }

      const newAccount = await tx.cashAccount.create({
        data: {
          name,
          type,
          balance: new Decimal(initialBalance),
          accountNumber: accountNumber || null,
          isActive: true,
          isDefault: isDefault || false
        }
      })

      await tx.cashTransaction.create({
        data: {
          accountId: newAccount.id,
          type: "DEPOSIT",
          amount: new Decimal(initialBalance),
          description: "Saldo awal"
        }
      })

      return newAccount
    })

    revalidatePath("/owner/cashflow")

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      isDefault: account.isDefault
    }
  } catch (error) {
    console.error("Error creating cash account:", error)
    throw new Error("Gagal membuat akun kas")
  }
}

export async function updateCashAccount(params: z.infer<typeof updateAccountSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { id, name, type, accountNumber } = updateAccountSchema.parse(params)

  try {
    const account = await prisma.cashAccount.update({
      where: { id },
      data: {
        name,
        type,
        accountNumber: accountNumber || null
      }
    })

    revalidatePath("/owner/cashflow")

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      isDefault: account.isDefault
    }
  } catch (error) {
    console.error("Error updating cash account:", error)
    throw new Error("Gagal mengupdate akun kas")
  }
}

export async function deleteCashAccount(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const account = await prisma.cashAccount.findUnique({
      where: { id }
    })

    if (!account) {
      throw new Error("Akun tidak ditemukan")
    }

    if (account.isDefault) {
      throw new Error("Tidak dapat menghapus akun default. Silakan atur akun lain sebagai default terlebih dahulu.")
    }

    if (account.balance.greaterThan(0)) {
      throw new Error("Tidak dapat menghapus akun dengan saldo. Saldo saat ini: " + account.balance.toNumber().toLocaleString("id-ID"))
    }

    await prisma.cashAccount.delete({
      where: { id }
    })

    revalidatePath("/owner/cashflow")

    return { 
      success: true,
      message: "Akun kas berhasil dihapus. Historical transaksi tetap aman."
    }
  } catch (error) {
    console.error("Error deleting cash account:", error)
    throw new Error(error instanceof Error ? error.message : "Gagal menghapus akun kas")
  }
}

export async function toggleCashAccountActive(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const account = await prisma.cashAccount.findUnique({
      where: { id }
    })

    if (!account) {
      throw new Error("Account not found")
    }

    const updatedAccount = await prisma.cashAccount.update({
      where: { id },
      data: {
        isActive: !account.isActive
      }
    })

    revalidatePath("/owner/cashflow")

    return {
      id: updatedAccount.id,
      name: updatedAccount.name,
      type: updatedAccount.type,
      balance: updatedAccount.balance.toString(),
      accountNumber: updatedAccount.accountNumber,
      isActive: updatedAccount.isActive,
      isDefault: updatedAccount.isDefault
    }
  } catch (error) {
    console.error("Error toggling cash account active:", error)
    throw new Error("Gagal mengubah status akun kas")
  }
}

export async function getCashAccounts() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const accounts = await prisma.cashAccount.findMany({
      orderBy: [
        { type: "asc" },
        { name: "asc" }
      ]
    })

    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      isDefault: account.isDefault
    }))
  } catch (error) {
    console.error("Error fetching cash accounts:", error)
    throw new Error("Gagal mengambil data akun kas")
  }
}

export async function setDefaultAccount(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const account = await prisma.cashAccount.findUnique({
      where: { id }
    })

    if (!account) {
      throw new Error("Account not found")
    }

    await prisma.$transaction(async (tx) => {
      const existingDefault = await tx.cashAccount.findFirst({
        where: { type: account.type, isDefault: true }
      })

      if (existingDefault && existingDefault.id !== id) {
        await tx.cashAccount.update({
          where: { id: existingDefault.id },
          data: { isDefault: false }
        })
      }

      await tx.cashAccount.update({
        where: { id },
        data: { isDefault: true }
      })
    })

    revalidatePath("/owner/cashflow")

    return { success: true }
  } catch (error) {
    console.error("Error setting default account:", error)
    throw new Error("Gagal mengatur akun default")
  }
}

export async function getDefaultAccountByType(type: "TUNAI" | "QRIS" | "BANK") {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const account = await prisma.cashAccount.findFirst({
      where: {
        type,
        isDefault: true,
        isActive: true
      }
    })

    if (!account) {
      return null
    }

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      isDefault: account.isDefault
    }
  } catch (error) {
    console.error("Error fetching default account:", error)
    throw new Error("Gagal mengambil akun default")
  }
}

export async function createDefaultAccountIfNeeded(type: "TUNAI" | "QRIS" | "BANK", defaultName: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    let account = await getDefaultAccountByType(type)

    if (!account) {
      account = await prisma.$transaction(async (tx) => {
        const newAccount = await tx.cashAccount.create({
          data: {
            name: defaultName,
            type,
            balance: new Decimal(0),
            accountNumber: null,
            isActive: true,
            isDefault: true
          }
        })

        await tx.cashTransaction.create({
          data: {
            accountId: newAccount.id,
            type: "DEPOSIT",
            amount: new Decimal(0),
            description: "Akun default dibuat otomatis"
          }
        })

        return {
          id: newAccount.id,
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.balance.toString(),
          accountNumber: newAccount.accountNumber,
          isActive: newAccount.isActive,
          isDefault: newAccount.isDefault
        }
      })
    }

    return account
  } catch (error) {
    console.error("Error creating default account if needed:", error)
    throw new Error("Gagal membuat akun default")
  }
}

export async function getCashAccountById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const account = await prisma.cashAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            date: "desc"
          },
          take: 10
        }
      }
    })

    if (!account) {
      throw new Error("Account not found")
    }

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      isDefault: account.isDefault,
      transactions: account.transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        description: t.description,
        date: t.date,
        fromAccountId: t.fromAccountId,
        toAccountId: t.toAccountId
      }))
    }
  } catch (error) {
    console.error("Error fetching cash account:", error)
    throw new Error("Gagal mengambil data akun kas")
  }
}

export async function createTransaction(params: z.infer<typeof transactionSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { accountId, type, amount, description } = transactionSchema.parse(params)

  try {
    const account = await prisma.cashAccount.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      throw new Error("Account not found")
    }

    const amountDecimal = new Decimal(amount)

    if (type === "WITHDRAW" && account.balance.lessThan(amountDecimal)) {
      throw new Error("Saldo tidak mencukupi")
    }

    const newBalance = type === "DEPOSIT"
      ? account.balance.plus(amountDecimal)
      : account.balance.minus(amountDecimal)

    await prisma.cashAccount.update({
      where: { id: accountId },
      data: {
        balance: newBalance
      }
    })

    const transaction = await prisma.cashTransaction.create({
      data: {
        accountId,
        type,
        amount: amountDecimal,
        description
      }
    })

    revalidatePath("/owner/cashflow")

    return {
      id: transaction.id,
      accountId: transaction.accountId,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date.toISOString(),
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw new Error(error instanceof Error ? error.message : "Gagal membuat transaksi")
  }
}

export async function createTransfer(params: z.infer<typeof transferSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { fromAccountId, toAccountId, amount, description } = transferSchema.parse(params)

  if (fromAccountId === toAccountId) {
    throw new Error("Akun pengirim dan penerima tidak boleh sama")
  }

  try {
    const fromAccount = await prisma.cashAccount.findUnique({
      where: { id: fromAccountId }
    })

    const toAccount = await prisma.cashAccount.findUnique({
      where: { id: toAccountId }
    })

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found")
    }

    const amountDecimal = new Decimal(amount)

    if (fromAccount.balance.lessThan(amountDecimal)) {
      throw new Error("Saldo akun pengirim tidak mencukupi")
    }

    await prisma.$transaction([
      prisma.cashAccount.update({
        where: { id: fromAccountId },
        data: {
          balance: fromAccount.balance.minus(amountDecimal)
        }
      }),
      prisma.cashAccount.update({
        where: { id: toAccountId },
        data: {
          balance: toAccount.balance.plus(amountDecimal)
        }
      }),
      prisma.cashTransaction.create({
        data: {
          accountId: fromAccountId,
          fromAccountId,
          toAccountId,
          type: "TRANSFER",
          amount: amountDecimal,
          description
        }
      })
    ])

    revalidatePath("/owner/cashflow")

    return { success: true }
  } catch (error) {
    console.error("Error creating transfer:", error)
    throw new Error(error instanceof Error ? error.message : "Gagal melakukan transfer")
  }
}

export async function getCashTransactions(accountId?: string, limit: number = 50) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const where = accountId ? { accountId } : {}

    const transactions = await prisma.cashTransaction.findMany({
      where,
      include: {
        account: true,
        fromAccount: true,
        toAccount: true
      },
      orderBy: {
        date: "desc"
      },
      take: limit
    })

    return transactions.map(transaction => ({
      id: transaction.id,
      accountId: transaction.accountId,
      accountName: transaction.account?.name,
      fromAccountId: transaction.fromAccountId,
      fromAccountName: transaction.fromAccount?.name,
      toAccountId: transaction.toAccountId,
      toAccountName: transaction.toAccount?.name,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date.toISOString()
    }))
  } catch (error) {
    console.error("Error fetching cash transactions:", error)
    throw new Error("Gagal mengambil data transaksi")
  }
}

export async function getCashflowSummary() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const accounts = await prisma.cashAccount.findMany({
      where: { isActive: true },
      include: {
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        }
      }
    })

    const totalBalance = accounts.reduce((sum, acc) => 
      sum.plus(acc.balance), new Decimal(0)
    )

    const totalTransactions = accounts.reduce((sum, acc) => 
      sum + acc.transactions.length, 0
    )

    const cashBalance = accounts
      .filter(acc => acc.type === "TUNAI" && acc.isActive)
      .reduce((sum, acc) => sum.plus(acc.balance), new Decimal(0))

    const bankBalance = accounts
      .filter(acc => acc.type === "BANK" && acc.isActive)
      .reduce((sum, acc) => sum.plus(acc.balance), new Decimal(0))

    const qrisBalance = accounts
      .filter(acc => acc.type === "QRIS" && acc.isActive)
      .reduce((sum, acc) => sum.plus(acc.balance), new Decimal(0))

    return {
      totalBalance: totalBalance.toString(),
      totalAccounts: accounts.length,
      totalTransactions,
      cashBalance: cashBalance.toString(),
      bankBalance: bankBalance.toString(),
      qrisBalance: qrisBalance.toString()
    }
  } catch (error) {
    console.error("Error fetching cashflow summary:", error)
    throw new Error("Gagal mengambil ringkasan cashflow")
  }
}

export async function getAllTransactions(limit: number = 50) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const [cashTransactions, expenses, transactions] = await Promise.all([
      prisma.cashTransaction.findMany({
        include: {
          account: true,
          fromAccount: true,
          toAccount: true
        },
        orderBy: {
          date: "desc"
        },
        take: limit
      }),
      prisma.expense.findMany({
        orderBy: {
          date: "desc"
        },
        take: limit
      }),
      prisma.transaction.findMany({
        include: {
          barber: true,
          cashier: true
        },
        orderBy: {
          date: "desc"
        },
        take: limit
      })
    ])

    const cashTransactionsMapped = cashTransactions
      .filter(t => !t.description.startsWith("Transaksi ") && !t.description.startsWith("Pengeluaran: "))
      .map(t => ({
        id: t.id,
        date: t.date.toISOString(),
        amount: t.amount.toString(),
        description: t.description,
        type: t.type,
        source: "CASH_TRANSACTION" as const,
        accountName: t.account?.name || "Akun Dihapus",
        fromAccountName: t.fromAccount?.name,
        toAccountName: t.toAccount?.name,
        isIncome: t.type === "DEPOSIT"
      }))

    const expensesMapped = expenses.map(e => ({
      id: e.id,
      date: e.date.toISOString(),
      amount: e.amount.toString(),
      description: e.title,
      type: e.category,
      source: "EXPENSE" as const,
      accountName: e.category,
      isIncome: false
    }))

    const transactionsMapped = transactions.map(t => ({
      id: t.id,
      date: t.date.toISOString(),
      amount: t.totalAmount.toString(),
      description: `Transaksi #${String(t.transactionNumber).padStart(2, '0')} - ${t.barber.name}`,
      type: t.paymentMethod,
      source: "POS_TRANSACTION" as const,
      accountName: t.paymentMethod,
      barberName: t.barber.name,
      cashierName: t.cashier.username,
      isIncome: true
    }))

    const allTransactions = [
      ...cashTransactionsMapped,
      ...expensesMapped,
      ...transactionsMapped
    ]

    allTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return allTransactions.slice(0, limit)
  } catch (error) {
    console.error("Error fetching all transactions:", error)
    throw new Error("Gagal mengambil data transaksi")
  }
}
