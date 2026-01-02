"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  loadingMessage?: string
}

export function ChartContainer({
  title,
  children,
  loading = false,
  empty = false,
  emptyMessage = "Tidak ada data",
  loadingMessage = "Memuat data..."
}: ChartContainerProps) {
  return (
    <Card className="border-yellow-500 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {loadingMessage}
          </div>
        ) : empty ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
