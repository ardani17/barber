"use client"

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/decimal"

interface CashflowChartProps {
  data: Array<{ name: string; income: number; expenses: number }>
}

export function CashflowChart({ data }: CashflowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250} minHeight={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip
          formatter={(value: number | undefined) => value ? formatCurrency(value) : ""}
          contentStyle={{ fontSize: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#f97316"
          strokeWidth={2}
          name="Pemasukan"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          name="Pengeluaran"
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
