"use server"

import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"
import { auth } from "@/lib/auth"
import { z } from "zod"

const getTransactionsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  barberId: z.string().optional(),
  cashierId: z.string().optional(),
  paymentMethod: z.enum(["TUNAI", "QRIS"]).optional(),
  search: z.string().optional()
})

export async function getTransactions(params: z.infer<typeof getTransactionsSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { startDate, endDate, barberId, cashierId, paymentMethod, search } = getTransactionsSchema.parse(params)

  const where: any = {
    date: {
      gte: startDate,
      lte: endDate
    }
  }

  if (barberId) {
    where.barberId = barberId
  }

  if (cashierId) {
    where.cashierId = cashierId
  }

  if (paymentMethod) {
    where.paymentMethod = paymentMethod
  }

  if (search) {
    where.OR = [
      { barber: { name: { contains: search, mode: "insensitive" } } },
      { cashier: { username: { contains: search, mode: "insensitive" } } },
      { items: { some: { service: { name: { contains: search, mode: "insensitive" } } } } },
      { items: { some: { product: { name: { contains: search, mode: "insensitive" } } } } }
    ]
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      barber: true,
      cashier: true,
      items: {
        include: {
          service: true,
          product: true
        }
      }
    },
    orderBy: {
      date: "desc"
    }
  })

  return transactions.map(transaction => ({
    id: transaction.id,
    transactionNumber: transaction.transactionNumber,
    date: transaction.date,
    totalAmount: transaction.totalAmount.toString(),
    totalCommission: transaction.totalCommission.toString(),
    paymentMethod: transaction.paymentMethod,
    barberName: transaction.barber.name,
    barberId: transaction.barberId,
    cashierName: transaction.cashier.username,
    cashierId: transaction.cashierId,
    items: transaction.items.map(item => ({
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      subtotal: item.subtotal.toString(),
      name: item.service?.name || item.product?.name || "Unknown"
    }))
  }))
}

export async function getTransactionById(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      barber: true,
      cashier: true,
      items: {
        include: {
          service: true,
          product: true
        }
      }
    }
  })

  if (!transaction) {
    throw new Error("Transaction not found")
  }

  return {
    id: transaction.id,
    transactionNumber: transaction.transactionNumber,
    date: transaction.date,
    totalAmount: transaction.totalAmount.toString(),
    totalCommission: transaction.totalCommission.toString(),
    paymentMethod: transaction.paymentMethod,
    barberName: transaction.barber.name,
    barberId: transaction.barberId,
    cashierName: transaction.cashier.username,
    cashierId: transaction.cashierId,
    items: transaction.items.map(item => ({
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      subtotal: item.subtotal.toString(),
      name: item.service?.name || item.product?.name || "Unknown"
    }))
  }
}

export async function getBarbers() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  })

  return barbers.map(barber => ({
    id: barber.id,
    name: barber.name
  }))
}

export async function getCashiers() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const cashiers = await prisma.user.findMany({
    where: { role: "CASHIER" },
    orderBy: { username: "asc" }
  })

  return cashiers.map(cashier => ({
    id: cashier.id,
    username: cashier.username
  }))
}
