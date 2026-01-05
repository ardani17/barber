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

const getDailySummarySchema = z.object({
  startDate: z.date(),
  endDate: z.date()
})

export async function getDailySummary(params: z.infer<typeof getDailySummarySchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { startDate, endDate } = getDailySummarySchema.parse(params)

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
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

  const services: Record<string, number> = {}
  const products: Record<string, number> = {}

  transactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (item.type === "SERVICE" && item.service) {
        services[item.service.name] = (services[item.service.name] || 0) + item.quantity
      } else if (item.type === "PRODUCT" && item.product) {
        products[item.product.name] = (products[item.product.name] || 0) + item.quantity
      }
    })
  })

  const servicesList = Object.entries(services).map(([name, quantity]) => ({
    name,
    quantity
  })).sort((a, b) => b.quantity - a.quantity)

  const productsList = Object.entries(products).map(([name, quantity]) => ({
    name,
    quantity
  })).sort((a, b) => b.quantity - a.quantity)

  const totalTransactions = transactions.length
  const totalRevenue = transactions.reduce((sum, t) => sum.plus(t.totalAmount), new Decimal(0)).toString()
  const totalCommission = transactions.reduce((sum, t) => sum.plus(t.totalCommission), new Decimal(0)).toString()

  return {
    services: servicesList,
    products: productsList,
    totalTransactions,
    totalRevenue,
    totalCommission
  }
}
