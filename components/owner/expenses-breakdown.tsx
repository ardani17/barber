import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"

interface ExpensesBreakdownProps {
  categories: Array<{ category: string; categoryLabel: string; totalAmount: string; count: number }>
  loading?: boolean
}

export function ExpensesBreakdown({ categories, loading }: ExpensesBreakdownProps) {
  const categoryIcons: Record<string, string> = {
    RENT: "🏠",
    UTILITIES: "💡",
    SUPPLIES: "📦",
    OTHER: "📋"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcons[category.category] || "📋"}</span>
                  <span className="text-muted-foreground">{category.categoryLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{category.count} transaksi</Badge>
                  <span className="font-medium">{formatCurrency(category.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada data pengeluaran
          </p>
        )}
      </CardContent>
    </Card>
  )
}
