import { DashboardFilters } from "./dashboard-filters"
import { DashboardMetrics } from "./dashboard-metrics"
import { ChartContainer } from "@/components/owner/chart-container"
import { CashflowChart } from "@/components/owner/charts/cashflow-chart"
import { CommissionChart } from "@/components/owner/charts/commission-chart"
import { RevenueBreakdown } from "@/components/owner/revenue-breakdown"
import { ExpensesBreakdown } from "@/components/owner/expenses-breakdown"
import { getDashboardData } from "@/actions/dashboard"
import Decimal from "decimal.js"
import { Suspense } from "react"
import type { DateRangeType } from "@/types"

export const metadata = {
  title: "Dashboard - BaberShop",
  description: "Ringkasan keuangan barbershop Anda"
}

export const dynamic = "force-dynamic"

function getDateRange(searchParams: { range?: string; start?: string; end?: string }) {
  const range = (searchParams.range as DateRangeType) || "month"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let startDate: Date
  let endDate: Date
  
  if (range === "week") {
    startDate = new Date(today)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate = new Date(today)
    endDate.setDate(endDate.getDate() - endDate.getDay() + 6)
  } else if (range === "month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  } else if (range === "quarter") {
    const quarter = Math.floor(today.getMonth() / 3)
    startDate = new Date(today.getFullYear(), quarter * 3, 1)
    endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0)
  } else if (range === "year") {
    startDate = new Date(today.getFullYear(), 0, 1)
    endDate = new Date(today.getFullYear(), 11, 31)
  } else if (range === "custom" && searchParams.start && searchParams.end) {
    startDate = new Date(searchParams.start)
    endDate = new Date(searchParams.end)
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  }
  
  endDate.setHours(23, 59, 59, 999)
  
  return { startDate, endDate }
}

function processDashboardData(data: Awaited<ReturnType<typeof getDashboardData>>) {
  const { stats, dailyRevenue, barberRevenue, expenses, topServices, topProducts, paymentMethods, expensesByCategory } = data
  
  const totalExpenses = expenses.reduce((sum, expense) => sum.plus(expense.amount), new Decimal(0))
  
  const monthRevenue = new Decimal(stats.monthRevenue)
  const monthCommission = new Decimal(stats.monthCommission)
  const grossProfit = monthRevenue
  const netProfit = monthRevenue.minus(totalExpenses).minus(monthCommission)
  
  const cashflowData = dailyRevenue.map(dr => {
    const date = new Date(dr.date)
    const monthName = date.toLocaleDateString("id-ID", { month: "short" })
    const dayExpenses = expenses.filter(e => 
      new Date(e.date).toISOString().split("T")[0] === dr.date
    ).reduce((sum, e) => sum.plus(e.amount), new Decimal(0))
    
    return {
      name: `${monthName} ${date.getDate()}`,
      income: parseFloat(dr.revenue),
      expenses: dayExpenses.toNumber()
    }
  })
  
  const commissionData = barberRevenue.map(br => ({
    name: br.barberName,
    revenue: parseFloat(br.totalRevenue),
    commission: parseFloat(br.totalCommission)
  }))
  
  return {
    metrics: {
      grossProfit: grossProfit.toString(),
      totalExpenses: totalExpenses.toString(),
      totalCommissions: monthCommission.toString(),
      netProfit: netProfit.toString(),
      revenueGrowth: stats.revenueGrowth
    },
    cashflowData,
    commissionData,
    revenueBreakdown: {
      topServices,
      topProducts,
      paymentMethods
    },
    expensesBreakdown: {
      categories: expensesByCategory
    }
  }
}

async function DashboardContent({
  searchParams
}: {
  searchParams: { range?: string; start?: string; end?: string }
}) {
  const { startDate, endDate } = getDateRange(searchParams)
  const data = await getDashboardData({ startDate, endDate })
  const processedData = processDashboardData(data)
  
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Ringkasan keuangan barbershop Anda</p>
        </div>
        <DashboardFilters />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetrics
          grossProfit={processedData.metrics.grossProfit}
          totalExpenses={processedData.metrics.totalExpenses}
          totalCommissions={processedData.metrics.totalCommissions}
          netProfit={processedData.metrics.netProfit}
          revenueGrowth={parseFloat(processedData.metrics.revenueGrowth)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartContainer
          title="Arus Kas"
          empty={processedData.cashflowData.length === 0}
          emptyMessage="Tidak ada data arus kas"
        >
          <CashflowChart data={processedData.cashflowData} />
        </ChartContainer>

        <ChartContainer
          title="Komisi per Barber"
          empty={processedData.commissionData.length === 0}
          emptyMessage="Tidak ada data komisi"
        >
          <CommissionChart data={processedData.commissionData} />
        </ChartContainer>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RevenueBreakdown
          topServices={processedData.revenueBreakdown.topServices}
          topProducts={processedData.revenueBreakdown.topProducts}
          paymentMethods={processedData.revenueBreakdown.paymentMethods}
        />

        <ExpensesBreakdown
          categories={processedData.expensesBreakdown.categories}
        />
      </div>
    </div>
  )
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { range?: string; start?: string; end?: string }
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-80 bg-muted animate-pulse rounded" />
        <div className="h-80 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-80 bg-muted animate-pulse rounded" />
        <div className="h-80 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
