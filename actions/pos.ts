"use server"

import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createDefaultAccountIfNeeded } from "./cashflow"
import { invalidateDashboardCache, invalidateTransactionCache } from "@/lib/redis"

export async function checkoutTransaction(data: {
  items: Array<{
    id: string
    type: "SERVICE" | "PRODUCT"
    name: string
    price: number
    quantity: number
  }>
  barberId: string
  paymentMethod: "TUNAI" | "QRIS"
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const totalAmount = data.items.reduce((sum, item) => 
      sum.add(new Decimal(item.price).mul(item.quantity)), 
      new Decimal(0)
    )

    let totalCommission = new Decimal(0)

    for (const item of data.items) {
      if (item.type === "SERVICE") {
        const barber = await prisma.barber.findUnique({
          where: { id: data.barberId }
        })

        if (barber) {
          const itemPrice = new Decimal(item.price)
          const commissionThreshold = new Decimal(30000)

          if (itemPrice.gte(commissionThreshold)) {
            const commission = new Decimal(barber.commissionRate.toString()).mul(item.quantity)
            totalCommission = totalCommission.add(commission)
          }
        }
      }

      if (item.type === "PRODUCT") {
        await prisma.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }
    }

    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        transactionNumber: "desc"
      }
    })

    const transactionNumber = lastTransaction ? lastTransaction.transactionNumber + 1 : 1

    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        totalAmount,
        totalCommission,
        paymentMethod: data.paymentMethod,
        cashierId: session.user.id,
        barberId: data.barberId,
        items: {
          create: data.items.map(item => ({
            type: item.type,
            quantity: item.quantity,
            unitPrice: new Decimal(item.price),
            subtotal: new Decimal(item.price).mul(item.quantity),
            serviceId: item.type === "SERVICE" ? item.id : null,
            productId: item.type === "PRODUCT" ? item.id : null
          }))
        }
      }
    })

    const accountType = data.paymentMethod === "TUNAI" ? "TUNAI" : "QRIS"
    const defaultAccountName = accountType === "TUNAI" ? "Kasir Utama" : "Rekening QRIS"

    const cashAccount = await createDefaultAccountIfNeeded(accountType, defaultAccountName)

    await prisma.cashAccount.update({
      where: { id: cashAccount.id },
      data: { balance: { increment: totalAmount } }
    })

    await prisma.cashTransaction.create({
      data: {
        accountId: cashAccount.id,
        type: "DEPOSIT",
        amount: totalAmount,
        description: `Transaksi ${transaction.date.toISOString().split('T')[0]} ${String(transaction.transactionNumber).padStart(2, '0')}`
      }
    })

    revalidatePath("/pos")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/owner/cashflow")

    await invalidateDashboardCache()
    await invalidateTransactionCache()

    return { success: true, transactionId: transaction.id }
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat checkout" }
  }
}
