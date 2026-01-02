"use client"

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/decimal"

interface CommissionChartProps {
  data: Array<{ name: string; commission: number }>
}

export function CommissionChart({ data }: CommissionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250} minHeight={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip
          formatter={(value: number | undefined) => value ? formatCurrency(value) : ""}
          contentStyle={{ fontSize: '12px' }}
        />
        <Bar
          dataKey="commission"
          fill="#f97316"
          name="Total Komisi"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
