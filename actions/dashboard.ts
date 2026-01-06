"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Decimal from "decimal.js"
import { unstable_cache } from "next/cache"
import { getExpenses, getExpensesByCategory } from "./expenses"

const getDashboardStatsSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional()
})

export async function getDashboardStats(params: z.infer<typeof getDashboardStatsSchema> = {}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { startDate, endDate } = params

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfToday = new Date(today)
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  endOfLastMonth.setHours(23, 59, 59, 999)

  const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined

  try {
    const [todayRevenue, monthRevenue, lastMonthRevenue, totalTransactions, activeBarbers, lowStockProducts] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          date: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        _sum: {
          totalAmount: true
        },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          date: dateFilter || {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          totalAmount: true,
          totalCommission: true
        },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.transaction.count({
        where: {
          date: dateFilter || {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      prisma.barber.count({
        where: { isActive: true }
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lte: 5
          }
        }
      })
    ])

    const todayRevenueAmount = todayRevenue._sum.totalAmount || new Decimal(0)
    const monthRevenueAmount = monthRevenue._sum.totalAmount || new Decimal(0)
    const lastMonthRevenueAmount = lastMonthRevenue._sum.totalAmount || new Decimal(0)
    const monthCommissionAmount = monthRevenue._sum.totalCommission || new Decimal(0)

    const revenueGrowth = lastMonthRevenueAmount.equals(0)
      ? 0
      : monthRevenueAmount.minus(lastMonthRevenueAmount).div(lastMonthRevenueAmount).times(100).toNumber()

    return {
      todayRevenue: todayRevenueAmount.toString(),
      monthRevenue: monthRevenueAmount.toString(),
      monthCommission: monthCommissionAmount.toString(),
      totalTransactions,
      activeBarbers,
      lowStockProducts,
      revenueGrowth: revenueGrowth.toFixed(2)
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw new Error("Gagal mengambil data dashboard")
  }
}

export interface DashboardData {
  stats: Awaited<ReturnType<typeof getDashboardStats>>
  dailyRevenue: Awaited<ReturnType<typeof getDailyRevenue>>
  barberRevenue: Awaited<ReturnType<typeof getRevenueByBarber>>
  expenses: Awaited<ReturnType<typeof getExpenses>>
  topServices: Awaited<ReturnType<typeof getTopServices>>
  topProducts: Awaited<ReturnType<typeof getTopProducts>>
  paymentMethods: Awaited<ReturnType<typeof getRevenueByPaymentMethod>>
  expensesByCategory: Awaited<ReturnType<typeof getExpensesByCategory>>
}

export async function getDashboardData(params: {
  startDate: Date
  endDate: Date
}): Promise<DashboardData> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const cacheKey = `${params.startDate.getTime()}-${params.endDate.getTime()}`

  return unstable_cache(
    async () => {
      const [stats, dailyRevenue, barberRevenue, expenses, topServices, topProducts, paymentMethods, expensesByCategory] = await Promise.all([
        getDashboardStats(params),
        getDailyRevenue(params.startDate, params.endDate),
        getRevenueByBarber(params.startDate, params.endDate),
        getExpenses(params),
        getTopServices(params.startDate, params.endDate, 10),
        getTopProducts(params.startDate, params.endDate, 10),
        getRevenueByPaymentMethod(params.startDate, params.endDate),
        getExpensesByCategory(params.startDate, params.endDate)
      ])

      return {
        stats,
        dailyRevenue,
        barberRevenue,
        expenses,
        topServices,
        topProducts,
        paymentMethods,
        expensesByCategory
      }
    },
    [`dashboard-${cacheKey}`],
    {
      revalidate: 300,
      tags: ['dashboard', `dashboard-${cacheKey}`]
    }
  )()
}

export async function getRevenueByBarber(startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const transactions = await prisma.transaction.groupBy({
      by: ["barberId"],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalAmount: true,
        totalCommission: true
      },
      _count: true
    })

    const barberIds = transactions.map(t => t.barberId)

    const barbers = await prisma.barber.findMany({
      where: {
        id: { in: barberIds }
      }
    })

    const barberMap = new Map(barbers.map(b => [b.id, b.name]))

    return transactions.map(t => ({
      barberId: t.barberId,
      barberName: barberMap.get(t.barberId) || "Unknown",
      totalRevenue: t._sum.totalAmount?.toString() || "0",
      totalCommission: t._sum.totalCommission?.toString() || "0",
      transactionCount: t._count
    })).sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
  } catch (error) {
    console.error("Error fetching revenue by barber:", error)
    throw new Error("Gagal mengambil data pendapatan per barber")
  }
}

export async function getRevenueByPaymentMethod(startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const transactions = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    })

    return transactions.map(t => ({
      paymentMethod: t.paymentMethod,
      totalRevenue: t._sum.totalAmount?.toString() || "0",
      transactionCount: t._count
    }))
  } catch (error) {
    console.error("Error fetching revenue by payment method:", error)
    throw new Error("Gagal mengambil data pendapatan per metode pembayaran")
  }
}

export async function getDailyRevenue(startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        totalAmount: true
      },
      orderBy: {
        date: "asc"
      }
    })

    const dailyRevenue = new Map<string, Decimal>()

    transactions.forEach(t => {
      const dateKey = t.date.toISOString().split("T")[0]
      const current = dailyRevenue.get(dateKey) || new Decimal(0)
      dailyRevenue.set(dateKey, current.plus(t.totalAmount))
    })

    return Array.from(dailyRevenue.entries())
      .map(([date, amount]) => ({
        date,
        revenue: amount.toString()
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error("Error fetching daily revenue:", error)
    throw new Error("Gagal mengambil data pendapatan harian")
  }
}

export async function getTopServices(startDate: Date, endDate: Date, limit: number = 10) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const groupedResults = await prisma.transactionItem.groupBy({
      by: ["serviceId"],
      where: {
        type: "SERVICE",
        transaction: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        subtotal: true
      }
    })

    const serviceIds = groupedResults.filter(r => r.serviceId).map(r => r.serviceId!)

    if (serviceIds.length === 0) {
      return []
    }

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const serviceMap = new Map(services.map(s => [s.id, s.name]))

    return groupedResults
      .filter(r => r.serviceId !== null)
      .map(r => ({
        name: serviceMap.get(r.serviceId!) || "Unknown",
        quantity: r._sum.quantity || 0,
        revenue: r._sum.subtotal?.toString() || "0"
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching top services:", error)
    throw new Error("Gagal mengambil data layanan terpopuler")
  }
}

export async function getTopProducts(startDate: Date, endDate: Date, limit: number = 10) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const groupedResults = await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        type: "PRODUCT",
        transaction: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        subtotal: true
      }
    })

    const productIds = groupedResults.filter(r => r.productId).map(r => r.productId!)

    if (productIds.length === 0) {
      return []
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p.name]))

    return groupedResults
      .filter(r => r.productId !== null)
      .map(r => ({
        name: productMap.get(r.productId!) || "Unknown",
        quantity: r._sum.quantity || 0,
        revenue: r._sum.subtotal?.toString() || "0"
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching top products:", error)
    throw new Error("Gagal mengambil data produk terpopuler")
  }
}
