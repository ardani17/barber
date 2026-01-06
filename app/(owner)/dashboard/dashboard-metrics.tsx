"use client"

import { MetricCard } from "@/components/owner/metric-card"
import { DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardMetricsProps {
  grossProfit: string
  totalExpenses: string
  totalCommissions: string
  netProfit: string
  revenueGrowth: number
}

export function DashboardMetrics({
  grossProfit,
  totalExpenses,
  totalCommissions,
  netProfit,
  revenueGrowth
}: DashboardMetricsProps) {
  const isGrowthPositive = revenueGrowth >= 0

  return (
    <>
      <MetricCard
        title="Laba Kotor"
        value={grossProfit}
        icon={DollarSign}
        iconColor="text-yellow-500"
        trend={{
          value: Math.abs(revenueGrowth).toFixed(1),
          positive: isGrowthPositive,
          label: "dari periode lalu"
        }}
      />

      <MetricCard
        title="Total Pengeluaran"
        value={totalExpenses}
        icon={Wallet}
        iconColor="text-red-500"
      />

      <MetricCard
        title="Total Komisi Barber"
        value={totalCommissions}
        icon={TrendingUp}
        iconColor="text-blue-500"
      />

      <MetricCard
        title="Laba Bersih"
        value={netProfit}
        icon={TrendingDown}
        iconColor="text-green-500"
      />
    </>
  )
}
