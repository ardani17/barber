"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  iconColor?: string
  loading?: boolean
  trend?: {
    value: string
    positive: boolean
    label?: string
  }
  footer?: React.ReactNode
}

const MetricCardComponent = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-yellow-500",
  loading = false,
  trend,
  footer
}: MetricCardProps) => {
  return (
    <Card className="border-yellow-500 dark:border-gray-700 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-2xl sm:text-3xl font-bold">...</div>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(value)}
            </div>
            {trend && (
              <div className="flex items-center text-xs mt-2">
                {trend.positive ? (
                  <span className="text-green-600 font-medium">+{trend.value}% {trend.label || "dari periode lalu"}</span>
                ) : (
                  <span className="text-red-600 font-medium">{trend.value}% {trend.label || "dari periode lalu"}</span>
                )}
              </div>
            )}
            {footer && <div className="flex items-center text-xs text-muted-foreground mt-2">{footer}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export const MetricCard = memo(MetricCardComponent)
MetricCard.displayName = "MetricCard"
