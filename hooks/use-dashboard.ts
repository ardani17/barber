"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getDashboardData } from "@/actions/dashboard"
import { logError } from "@/lib/logger"
import type { DateRangeType } from "@/types"

interface DashboardMetrics {
  grossProfit: string
  totalExpenses: string
  totalCommissions: string
  netProfit: string
  revenueGrowth: string
}

interface CashflowData {
  name: string
  income: number
  expenses: number
}

interface CommissionData {
  name: string
  commission: number
}

interface RevenueBreakdown {
  topServices: Array<{ name: string; quantity: number; revenue: string }>
  topProducts: Array<{ name: string; quantity: number; revenue: string }>
  paymentMethods: Array<{ paymentMethod: string; totalRevenue: string; transactionCount: number }>
}

interface ExpensesBreakdown {
  categories: Array<{ category: string; categoryLabel: string; totalAmount: string; count: number }>
}

interface DashboardData {
  metrics: DashboardMetrics
  cashflowData: CashflowData[]
  commissionData: CommissionData[]
  revenueBreakdown: RevenueBreakdown
  expensesBreakdown: ExpensesBreakdown
}

const INITIAL_DATA: DashboardData = {
  metrics: {
    grossProfit: "0",
    totalExpenses: "0",
    totalCommissions: "0",
    netProfit: "0",
    revenueGrowth: "0"
  },
  cashflowData: [],
  commissionData: [],
  revenueBreakdown: {
    topServices: [],
    topProducts: [],
    paymentMethods: []
  },
  expensesBreakdown: {
    categories: []
  }
}

export function useDashboard(selectedRange: DateRangeType, customStartDate?: Date, customEndDate?: Date) {
  const [data, setData] = useState<DashboardData>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      let startDate: Date
      let endDate: Date

      switch (selectedRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
          break
        case "week":
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          startDate = new Date(weekAgo.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
          break
        case "month":
          const monthAgo = new Date(now)
          monthAgo.setDate(monthAgo.getDate() - 30)
          startDate = new Date(monthAgo.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
          break
        case "custom":
          startDate = customStartDate || new Date(now.setHours(0, 0, 0, 0))
          endDate = customEndDate || new Date(now.setHours(23, 59, 59, 999))
          break
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
      }

      const dashboardData = await getDashboardData({ startDate, endDate })

      if (!abortControllerRef.current.signal.aborted) {
        setData(dashboardData)
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        setError("Terjadi kesalahan saat memuat data dashboard")
        logError("Dashboard", "Error loading dashboard data", err)
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [selectedRange, customStartDate, customEndDate])

  useEffect(() => {
    loadData()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadData])

  return {
    data,
    loading,
    error,
    loadData
  }
}
