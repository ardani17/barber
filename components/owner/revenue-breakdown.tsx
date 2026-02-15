import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Package, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"

interface RevenueBreakdownProps {
  topServices: Array<{ name: string; quantity: number; revenue: string }>
  topProducts: Array<{ name: string; quantity: number; revenue: string }>
  paymentMethods: Array<{ paymentMethod: string; totalRevenue: string; transactionCount: number }>
  loading?: boolean
}

const RevenueBreakdownComponent = ({ topServices, topProducts, paymentMethods, loading }: RevenueBreakdownProps) => {
  const paymentMethodLabels: Record<string, string> = {
    CASH: "Tunai",
    TRANSFER: "Transfer Bank",
    E_WALLET: "E-Wallet"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse h-32 bg-muted rounded" />
            <div className="animate-pulse h-32 bg-muted rounded" />
            <div className="animate-pulse h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian Pemasukan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {topServices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scissors className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-sm">Layanan Terlaris</h3>
            </div>
            <div className="space-y-2">
              {topServices.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{service.quantity} transaksi</Badge>
                    <span className="font-medium">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-sm">Produk Terlaris</h3>
            </div>
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{product.quantity} terjual</Badge>
                    <span className="font-medium">{formatCurrency(product.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paymentMethods.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold text-sm">Metode Pembayaran</h3>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {paymentMethodLabels[method.paymentMethod] || method.paymentMethod}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{method.transactionCount} transaksi</Badge>
                    <span className="font-medium">{formatCurrency(method.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topServices.length === 0 && topProducts.length === 0 && paymentMethods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada data pemasukan
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export const RevenueBreakdown = memo(RevenueBreakdownComponent)
RevenueBreakdown.displayName = "RevenueBreakdown"
