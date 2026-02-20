"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import Decimal from "decimal.js"
import { logError } from "@/lib/logger"
import { unstable_cache } from "next/cache"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"

const expenseCategoryLabels: Record<string, string> = {
  RENT: "Sewa Kontrakan",
  UTILITIES: "Utilitas",
  SUPPLIES: "Perlengkapan",
  KASBON: "Kasbon",
  OTHER: "Lainnya"
}

const getDashboardStatsSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional()
})

type DashboardStatsResult = {
  todayRevenue: string
  monthRevenue: string
  monthCommission: string
  totalTransactions: number
  activeBarbers: number
  lowStockProducts: number
  revenueGrowth: string
}

async function fetchDashboardStatsCore(dateKey: string): Promise<DashboardStatsResult> {
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
        date: {
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
        date: {
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
}

const cachedFetchDashboardStats = unstable_cache(
  fetchDashboardStatsCore,
  ["dashboard-stats"],
  {
    revalidate: CACHE_TTL.MEDIUM,
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.TRANSACTIONS]
  }
)

export async function getDashboardStats(params: z.infer<typeof getDashboardStatsSchema> = {}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const today = new Date()
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  try {
    return await cachedFetchDashboardStats(dateKey)
  } catch (error) {
    logError("Dashboard", "Error fetching dashboard stats", error)
    throw new Error("Gagal mengambil data dashboard")
  }
}

const getDashboardDataSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
})

type DashboardDataResult = {
  metrics: {
    grossProfit: string
    totalExpenses: string
    totalCommissions: string
    netProfit: string
    revenueGrowth: string
  }
  cashflowData: Array<{ name: string; income: number; expenses: number }>
  commissionData: Array<{ name: string; commission: number }>
  revenueBreakdown: {
    topServices: Array<{ name: string; quantity: number; revenue: string }>
    topProducts: Array<{ name: string; quantity: number; revenue: string }>
    paymentMethods: Array<{ paymentMethod: string; totalRevenue: string; transactionCount: number }>
  }
  expensesBreakdown: {
    categories: Array<{ category: string; categoryLabel: string; totalAmount: string; count: number }>
  }
}

async function fetchDashboardDataCore(
  startDateStr: string,
  endDateStr: string
): Promise<DashboardDataResult> {
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  endOfLastMonth.setHours(23, 59, 59, 999)

  const [
    rangeTotals,
    lastMonthRevenue,
    expenseTotals,
    dailyRevenueRows,
    dailyExpenseRows,
    barberCommissions,
    paymentMethods,
    topServices,
    topProducts,
    expensesByCategory
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalAmount: true,
        totalCommission: true
      }
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
    prisma.expense.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.$queryRaw<Array<{ date: Date; revenue: Decimal | null }>>(Prisma.sql`
      SELECT date_trunc('day', "date")::date AS date, SUM("totalAmount") AS revenue
      FROM "Transaction"
      WHERE "date" BETWEEN ${startDate} AND ${endDate}
      GROUP BY 1
      ORDER BY 1
    `),
    prisma.$queryRaw<Array<{ date: Date; amount: Decimal | null }>>(Prisma.sql`
      SELECT date_trunc('day', "date")::date AS date, SUM("amount") AS amount
      FROM "Expense"
      WHERE "date" BETWEEN ${startDate} AND ${endDate}
      GROUP BY 1
      ORDER BY 1
    `),
    prisma.transaction.groupBy({
      by: ["barberId"],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalCommission: true
      }
    }),
    prisma.transaction.groupBy({
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
      _count: {
        _all: true
      }
    }),
    prisma.transactionItem.groupBy({
      by: ["serviceId"],
      where: {
        type: "SERVICE",
        serviceId: { not: null },
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
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 10
    }),
    prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        type: "PRODUCT",
        productId: { not: null },
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
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 10
    }),
    prisma.expense.groupBy({
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
      _count: {
        _all: true
      }
    })
  ])

  const totalExpenses = new Decimal(expenseTotals._sum.amount || 0)
  const grossProfit = new Decimal(rangeTotals._sum.totalAmount || 0)
  const totalCommissions = new Decimal(rangeTotals._sum.totalCommission || 0)
  const netProfit = grossProfit.minus(totalExpenses)

  const lastMonthRevenueAmount = new Decimal(lastMonthRevenue._sum.totalAmount || 0)
  const revenueGrowth = lastMonthRevenueAmount.equals(0)
    ? 0
    : grossProfit.minus(lastMonthRevenueAmount).div(lastMonthRevenueAmount).times(100).toNumber()

  const dailyIncomeMap = new Map<string, number>()
  dailyRevenueRows.forEach(row => {
    const dateKey = row.date.toISOString().split("T")[0]
    dailyIncomeMap.set(dateKey, new Decimal(row.revenue || 0).toNumber())
  })

  const dailyExpenseMap = new Map<string, number>()
  dailyExpenseRows.forEach(row => {
    const dateKey = row.date.toISOString().split("T")[0]
    dailyExpenseMap.set(dateKey, new Decimal(row.amount || 0).toNumber())
  })

  const cashflowDates = new Set([...dailyIncomeMap.keys(), ...dailyExpenseMap.keys()])
  const cashflowData = Array.from(cashflowDates)
    .sort((a, b) => a.localeCompare(b))
    .map(dateKey => {
      const dateObj = new Date(dateKey)
      const monthName = dateObj.toLocaleDateString("id-ID", { month: "short" })
      return {
        name: `${monthName} ${dateObj.getDate()}`,
        income: dailyIncomeMap.get(dateKey) || 0,
        expenses: dailyExpenseMap.get(dateKey) || 0
      }
    })

  const barberIds = barberCommissions.map(item => item.barberId)
  const barbers = barberIds.length
    ? await prisma.barber.findMany({
      where: { id: { in: barberIds } },
      select: { id: true, name: true }
    })
    : []

  const barberMap = new Map(barbers.map(b => [b.id, b.name]))
  const commissionData = barberCommissions
    .map(item => ({
      name: barberMap.get(item.barberId) || "Unknown",
      commission: new Decimal(item._sum.totalCommission || 0).toNumber()
    }))
    .sort((a, b) => b.commission - a.commission)

  const serviceIds = topServices.map(item => item.serviceId).filter(Boolean) as string[]
  const services = serviceIds.length
    ? await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true }
    })
    : []
  const serviceMap = new Map(services.map(service => [service.id, service.name]))

  const topServicesData = topServices.map(item => ({
    name: serviceMap.get(item.serviceId || "") || "Unknown",
    quantity: item._sum.quantity || 0,
    revenue: new Decimal(item._sum.subtotal || 0).toString()
  }))

  const productIds = topProducts.map(item => item.productId).filter(Boolean) as string[]
  const products = productIds.length
    ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })
    : []
  const productMap = new Map(products.map(product => [product.id, product.name]))

  const topProductsData = topProducts.map(item => ({
    name: productMap.get(item.productId || "") || "Unknown",
    quantity: item._sum.quantity || 0,
    revenue: new Decimal(item._sum.subtotal || 0).toString()
  }))

  const paymentMethodData = paymentMethods.map(item => ({
    paymentMethod: item.paymentMethod,
    totalRevenue: new Decimal(item._sum.totalAmount || 0).toString(),
    transactionCount: item._count._all
  }))

  const expensesCategoryData = expensesByCategory
    .map(item => ({
      category: item.category,
      categoryLabel: expenseCategoryLabels[item.category] || item.category,
      totalAmount: new Decimal(item._sum.amount || 0).toString(),
      count: item._count._all
    }))
    .sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount))

  return {
    metrics: {
      grossProfit: grossProfit.toString(),
      totalExpenses: totalExpenses.toString(),
      totalCommissions: totalCommissions.toString(),
      netProfit: netProfit.toString(),
      revenueGrowth: revenueGrowth.toFixed(2)
    },
    cashflowData,
    commissionData,
    revenueBreakdown: {
      topServices: topServicesData,
      topProducts: topProductsData,
      paymentMethods: paymentMethodData
    },
    expensesBreakdown: {
      categories: expensesCategoryData
    }
  }
}

const getCachedDashboardData = (startDateStr: string, endDateStr: string) => {
  return unstable_cache(
    () => fetchDashboardDataCore(startDateStr, endDateStr),
    [`dashboard-data-${startDateStr}-${endDateStr}`],
    {
      revalidate: CACHE_TTL.MEDIUM,
      tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.TRANSACTIONS, CACHE_TAGS.EXPENSES]
    }
  )()
}

export async function getDashboardData(params: z.infer<typeof getDashboardDataSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { startDate, endDate } = getDashboardDataSchema.parse(params)
  const startDateStr = startDate.toISOString()
  const endDateStr = endDate.toISOString()

  try {
    return await getCachedDashboardData(startDateStr, endDateStr)
  } catch (error) {
    logError("Dashboard", "Error loading dashboard data", error)
    throw new Error("Gagal mengambil data dashboard")
  }
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
    logError("Dashboard", "Error fetching revenue by barber", error)
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
      _count: {
        _all: true
      }
    })

    return transactions.map(t => ({
      paymentMethod: t.paymentMethod,
      totalRevenue: t._sum.totalAmount?.toString() || "0",
      transactionCount: t._count._all
    }))
  } catch (error) {
    logError("Dashboard", "Gagal mengambil data pendapatan per metode pembayaran", error)
    throw new Error("Gagal mengambil data pendapatan per metode pembayaran")
  }
}

export async function getDailyRevenue(startDate: Date, endDate: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ date: Date; revenue: Decimal | null }>>(Prisma.sql`
      SELECT date_trunc('day', "date")::date AS date, SUM("totalAmount") AS revenue
      FROM "Transaction"
      WHERE "date" BETWEEN ${startDate} AND ${endDate}
      GROUP BY 1
      ORDER BY 1
    `)

    return rows.map(row => ({
      date: row.date.toISOString().split("T")[0],
      revenue: new Decimal(row.revenue || 0).toString()
    }))
  } catch (error) {
    logError("Dashboard", "Error fetching daily revenue", error)
    throw new Error("Gagal mengambil data pendapatan harian")
  }
}

export async function getTopServices(startDate: Date, endDate: Date, limit: number = 10) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const items = await prisma.transactionItem.groupBy({
      by: ["serviceId"],
      where: {
        type: "SERVICE",
        serviceId: { not: null },
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
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: limit
    })

    const serviceIds = items.map(item => item.serviceId).filter(Boolean) as string[]
    const services = serviceIds.length
      ? await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, name: true }
      })
      : []

    const serviceMap = new Map(services.map(service => [service.id, service.name]))

    return items.map(item => ({
      name: serviceMap.get(item.serviceId || "") || "Unknown",
      quantity: item._sum.quantity || 0,
      revenue: new Decimal(item._sum.subtotal || 0).toString()
    }))
  } catch (error) {
    logError("Dashboard", "Gagal mengambil data layanan terpopuler", error)
    throw new Error("Gagal mengambil data layanan terpopuler")
  }
}

export async function getTopProducts(startDate: Date, endDate: Date, limit: number = 10) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const items = await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        type: "PRODUCT",
        productId: { not: null },
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
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: limit
    })

    const productIds = items.map(item => item.productId).filter(Boolean) as string[]
    const products = productIds.length
      ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
      })
      : []

    const productMap = new Map(products.map(product => [product.id, product.name]))

    return items.map(item => ({
      name: productMap.get(item.productId || "") || "Unknown",
      quantity: item._sum.quantity || 0,
      revenue: new Decimal(item._sum.subtotal || 0).toString()
    }))
  } catch (error) {
    logError("Dashboard", "Error fetching top products", error)
    throw new Error("Gagal mengambil data produk terpopuler")
  }
}
