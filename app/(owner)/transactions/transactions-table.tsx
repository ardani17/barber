"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import TransactionDetailModal from "./transaction-detail-modal"
import Pagination from "@/components/ui/pagination"

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

interface Barber {
  id: string
  name: string
}

interface Cashier {
  id: string
  username: string
}

interface TransactionsTableProps {
  transactions: Transaction[]
  barbers: Barber[]
  cashiers: Cashier[]
  selectedBarber: string
  selectedCashier: string
  selectedPaymentMethod: string
  searchQuery: string
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function TransactionsTable({
  transactions,
  barbers,
  cashiers,
  selectedBarber,
  selectedCashier,
  selectedPaymentMethod,
  searchQuery,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage
}: TransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setModalOpen(true)
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesBarber = selectedBarber === "all" || transaction.barberId === selectedBarber
    const matchesCashier = selectedCashier === "all" || transaction.cashierId === selectedCashier
    const matchesPaymentMethod = selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod
    const matchesSearch = searchQuery === "" || 
      transaction.transactionNumber.toString().includes(searchQuery) ||
      transaction.barberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cashierName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesBarber && matchesCashier && matchesPaymentMethod && matchesSearch
  })

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0)
  const totalCash = filteredTransactions
    .filter(t => t.paymentMethod === "TUNAI")
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0)
  const totalQRIS = filteredTransactions
    .filter(t => t.paymentMethod === "QRIS")
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0)

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set("page", page.toString())
    window.location.href = url.toString()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPage])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Pendapatan</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Tunai</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totalCash)}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">QRIS</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(totalQRIS)}
                </p>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Tidak ada transaksi ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          #{transaction.transactionNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell>{transaction.barberName}</TableCell>
                        <TableCell>{transaction.cashierName}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.paymentMethod === "TUNAI" ? "default" : "secondary"}
                            className={transaction.paymentMethod === "TUNAI" 
                              ? "bg-green-500 hover:bg-green-600" 
                              : ""
                            }
                          >
                            {transaction.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
