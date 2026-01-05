"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown, DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { DateRangePicker } from "@/components/owner/date-range-picker"
import { MetricCard } from "@/components/owner/metric-card"
import { ChartContainer } from "@/components/owner/chart-container"
import { CashflowChart } from "@/components/owner/charts/cashflow-chart"
import { CommissionChart } from "@/components/owner/charts/commission-chart"
import { RevenueBreakdown } from "@/components/owner/revenue-breakdown"
import { ExpensesBreakdown } from "@/components/owner/expenses-breakdown"
import { useDashboard } from "@/hooks/use-dashboard"
import type { DateRangeType } from "@/types"

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState<DateRangeType>("month")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()

  const { data, loading } = useDashboard(selectedRange, customStartDate, customEndDate)

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Ringkasan keuangan barbershop Anda</p>
        </div>
        <DateRangePicker
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Laba Kotor"
          value={data.metrics.grossProfit}
          icon={DollarSign}
          iconColor="text-yellow-500"
          loading={loading}
          trend={{
            value: data.metrics.revenueGrowth,
            positive: parseFloat(data.metrics.revenueGrowth) >= 0
          }}
        />

        <MetricCard
          title="Total Pengeluaran"
          value={data.metrics.totalExpenses}
          icon={Wallet}
          iconColor="text-red-500"
          loading={loading}
          footer="Dari periode ini"
        />

        <MetricCard
          title="Total Komisi Barber"
          value={data.metrics.totalCommissions}
          icon={TrendingUp}
          iconColor="text-yellow-500"
          loading={loading}
          footer="Dari periode ini"
        />

        <MetricCard
          title="Laba Bersih"
          value={data.metrics.netProfit}
          icon={TrendingDown}
          iconColor="text-green-500"
          loading={loading}
          footer={parseFloat(data.metrics.netProfit) >= 0 ? "Profit" : "Rugi"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartContainer
          title="Arus Kas"
          loading={loading}
          empty={data.cashflowData.length === 0}
          emptyMessage="Tidak ada data arus kas"
        >
          <CashflowChart data={data.cashflowData} />
        </ChartContainer>

        <ChartContainer
          title="Komisi per Barber"
          loading={loading}
          empty={data.commissionData.length === 0}
          emptyMessage="Tidak ada data komisi"
        >
          <CommissionChart data={data.commissionData} />
        </ChartContainer>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RevenueBreakdown
          topServices={data.revenueBreakdown.topServices}
          topProducts={data.revenueBreakdown.topProducts}
          paymentMethods={data.revenueBreakdown.paymentMethods}
          loading={loading}
        />

        <ExpensesBreakdown
          categories={data.expensesBreakdown.categories}
          loading={loading}
        />
      </div>
    </div>
  )
}
