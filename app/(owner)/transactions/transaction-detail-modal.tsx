"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/decimal"

interface Transaction {
  id: string
  transactionNumber: number
  date: Date
  totalAmount: string
  totalCommission: string
  paymentMethod: "TUNAI" | "QRIS"
  barberName: string
  barberId: string
  cashierName: string
  cashierId: string
  items: Array<{
    type: string
    quantity: number
    unitPrice: string
    subtotal: string
    name: string
  }>
}

interface TransactionDetailModalProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TransactionDetailModal({
  transaction,
  open,
  onOpenChange
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const services = transaction.items.filter(item => item.type === "SERVICE")
  const products = transaction.items.filter(item => item.type === "PRODUCT")

  const servicesTotal = services.reduce(
    (sum, s) => sum + parseFloat(s.subtotal),
    0
  )
  const productsTotal = products.reduce(
    (sum, p) => sum + parseFloat(p.subtotal),
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription>
            Nomor Transaksi: {transaction.transactionNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">
                {new Date(transaction.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
              <Badge
                variant={transaction.paymentMethod === "TUNAI" ? "default" : "secondary"}
              >
                {transaction.paymentMethod}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Barber</p>
              <p className="font-medium">{transaction.barberName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kasir</p>
              <p className="font-medium">{transaction.cashierName}</p>
            </div>
          </div>

          {services.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Layanan</h4>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Layanan</th>
                      <th className="text-right p-2">Harga</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{service.name}</td>
                        <td className="text-right p-2">
                          {formatCurrency(service.unitPrice)}
                        </td>
                        <td className="text-center p-2">{service.quantity}</td>
                        <td className="text-right p-2">
                          {formatCurrency(service.subtotal)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted">
                      <td className="p-2 font-medium" colSpan={3}>
                        Total Layanan
                      </td>
                      <td className="text-right p-2 font-medium">
                        {formatCurrency(servicesTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Produk</h4>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Produk</th>
                      <th className="text-right p-2">Harga</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{product.name}</td>
                        <td className="text-right p-2">
                          {formatCurrency(product.unitPrice)}
                        </td>
                        <td className="text-center p-2">{product.quantity}</td>
                        <td className="text-right p-2">
                          {formatCurrency(product.subtotal)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted">
                      <td className="p-2 font-medium" colSpan={3}>
                        Total Produk
                      </td>
                      <td className="text-right p-2 font-medium">
                        {formatCurrency(productsTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(servicesTotal + productsTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
