"use client"

import { useState, useEffect } from "react"
import { getDashboardStats, getDailyRevenue, getRevenueByBarber } from "@/actions/dashboard"
import { getExpenses } from "@/actions/expenses"
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

interface DashboardData {
  metrics: DashboardMetrics
  cashflowData: CashflowData[]
  commissionData: CommissionData[]
}

export function useDashboard(selectedRange: DateRangeType, customStartDate?: Date, customEndDate?: Date) {
  const [data, setData] = useState<DashboardData>({
    metrics: {
      grossProfit: "0",
      totalExpenses: "0",
      totalCommissions: "0",
      netProfit: "0",
      revenueGrowth: "0"
    },
    cashflowData: [],
    commissionData: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
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

      const [stats, dailyRevenue, barberRevenue, expenses] = await Promise.all([
        getDashboardStats({ startDate, endDate }),
        getDailyRevenue(startDate, endDate),
        getRevenueByBarber(startDate, endDate),
        getExpenses({ startDate, endDate })
      ])

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      const grossProfit = parseFloat(stats.monthRevenue)
      const netProfit = grossProfit - totalExpenses

      const formattedCashflow = dailyRevenue.map((dr, index) => {
        const date = new Date(dr.date)
        const monthName = date.toLocaleDateString("id-ID", { month: "short" })
        return {
          name: `${monthName} ${date.getDate()}`,
          income: parseFloat(dr.revenue),
          expenses: expenses.filter(e => new Date(e.date).toISOString().split("T")[0] === dr.date)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        }
      })

      const formattedCommission = barberRevenue.map(br => ({
        name: br.barberName,
        commission: parseFloat(br.totalCommission)
      }))

      setData({
        metrics: {
          grossProfit: grossProfit.toString(),
          totalExpenses: totalExpenses.toString(),
          totalCommissions: stats.monthCommission,
          netProfit: netProfit.toString(),
          revenueGrowth: stats.revenueGrowth
        },
        cashflowData: formattedCashflow,
        commissionData: formattedCommission
      })
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data dashboard")
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedRange, customStartDate, customEndDate])

  return {
    data,
    loading,
    error,
    loadData
  }
}
