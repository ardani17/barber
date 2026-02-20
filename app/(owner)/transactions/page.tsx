"use client"

import { useState, useEffect, useCallback } from "react"
import { logError } from "@/lib/logger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Search, Calendar, Download, Filter, Eye, Plus, Edit, Trash2, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { formatCurrency } from "@/lib/decimal"
import {
  getTransactions,
  getBarbers,
  getCashiers
} from "@/actions/transactions"
import {
  createExpense,
  updateExpense,
  convertExpenseToKasbon,
  deleteExpense,
  getExpenses
} from "@/actions/expenses"
import { getCashAccounts } from "@/actions/cashflow"

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

interface Expense {
  id: string
  date: Date
  category: "RENT" | "UTILITIES" | "SUPPLIES" | "KASBON" | "OTHER"
  amount: string
  description: string
  accountId?: string | null
  accountName?: string | null
  barberId?: string | null
  barberName?: string | null
  salaryDebtId?: string | null
}

const expenseCategories = [
  { label: "Sewa Kontrakan", value: "RENT" },
  { label: "Listrik/Air/Internet", value: "UTILITIES" },
  { label: "Peralatan/Perlengkapan", value: "SUPPLIES" },
  { label: "Kasbon", value: "KASBON" },
  { label: "Lainnya", value: "OTHER" }
]

const dateRanges = [
  { label: "Hari Ini", value: "today" },
  { label: "Minggu Ini", value: "week" },
  { label: "Bulan Ini", value: "month" },
  { label: "Bulan Lalu", value: "lastMonth" },
  { label: "Tahun Ini", value: "year" },
  { label: "Kustom", value: "custom" }
]

interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState("today")
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<string>("all")
  const [selectedCashier, setSelectedCashier] = useState<string>("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const [activeTab, setActiveTab] = useState("transactions")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState<{
    category: "RENT" | "UTILITIES" | "SUPPLIES" | "KASBON" | "OTHER"
    amount: string
    description: string
    date: Date
    accountId: string
    barberId: string
  }>({
    category: "RENT",
    amount: "",
    description: "",
    date: new Date(),
    accountId: "",
    barberId: ""
  })
  const [cashAccounts, setCashAccounts] = useState<Array<{ id: string; name: string; type: string; balance: string; isActive: boolean }>>([])
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("")
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>("all")
  const [expensePagination, setExpensePagination] = useState<PaginationState>(initialPagination)

  const debouncedExpenseSearchQuery = useDebounce(expenseSearchQuery, 300)

  useEffect(() => {
    if (activeTab === "transactions") {
      loadData(1)
    }
  }, [selectedRange, customStartDate, customEndDate, selectedBarber, selectedCashier, selectedPaymentMethod, debouncedSearchQuery, activeTab])

  useEffect(() => {
    if (activeTab === "expenses") {
      loadExpenses(1)
    }
  }, [selectedRange, customStartDate, customEndDate, selectedExpenseCategory, debouncedExpenseSearchQuery, activeTab])

  useEffect(() => {
    loadCashAccounts()
    loadBarbersAndCashiers()
  }, [])

  const loadCashAccounts = async () => {
    try {
      const accounts = await getCashAccounts()
      setCashAccounts(accounts)
    } catch (error) {
      logError("Transactions", "Error loading cash accounts", error)
    }
  }

  const loadBarbersAndCashiers = async () => {
    try {
      const [barbersData, cashiersData] = await Promise.all([
        getBarbers(),
        getCashiers()
      ])
      setBarbers(barbersData)
      setCashiers(cashiersData)
    } catch (error) {
      logError("Transactions", "Error loading barbers and cashiers", error)
    }
  }

  const loadData = async (page: number = pagination.page) => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange(selectedRange)

      const result = await getTransactions({
        startDate,
        endDate,
        barberId: selectedBarber === "all" ? undefined : selectedBarber,
        cashierId: selectedCashier === "all" ? undefined : selectedCashier,
        paymentMethod: selectedPaymentMethod === "all" ? undefined : (selectedPaymentMethod as "TUNAI" | "QRIS"),
        search: debouncedSearchQuery || undefined,
        page,
        pageSize: pagination.pageSize
      })

      setTransactions(result.data)
      setPagination(result.pagination)
    } catch (error) {
      logError("Transactions", "Error loading transactions", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    loadData(newPage)
  }

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize, 10)
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }))
    loadData(1)
  }

  const loadExpenses = async (page: number = expensePagination.page) => {
    try {
      const { startDate, endDate } = getDateRange(selectedRange)
      
      const result = await getExpenses({
        startDate,
        endDate,
        category: selectedExpenseCategory === "all" ? undefined : (selectedExpenseCategory as any),
        search: debouncedExpenseSearchQuery || undefined,
        page,
        pageSize: expensePagination.pageSize
      })

      setExpenses(result.data)
      setExpensePagination(result.pagination)
    } catch (error) {
      logError("Transactions", "Error loading expenses", error)
    }
  }

  const handleExpensePageChange = (newPage: number) => {
    loadExpenses(newPage)
  }

  const handleExpensePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize, 10)
    setExpensePagination(prev => ({ ...prev, pageSize: size, page: 1 }))
    loadExpenses(1)
  }

  const getDateRange = (range: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (range === "custom") {
      return {
        startDate: customStartDate || today,
        endDate: customEndDate || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      }
    }

    switch (range) {
      case "today":
        return {
          startDate: today,
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        }
      case "week":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return {
          startDate: startOfWeek,
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        }
      case "month":
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        }
      case "lastMonth":
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        }
      case "year":
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }
      default:
        return {
          startDate: today,
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        }
    }
  }

  const handleRangeChange = (value: string) => {
    setSelectedRange(value)
    if (value === "custom") {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
    }
  }

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const exportToCSV = () => {
    const headers = ["ID", "Tanggal", "Barber", "Kasir", "Metode Pembayaran", "Total", "Komisi", "Item"]
    const rows = transactions.map(t => [
      t.id,
      new Date(t.date).toLocaleString("id-ID"),
      t.barberName,
      t.cashierName,
      t.paymentMethod,
      t.totalAmount,
      t.totalCommission,
      t.items.map(item => `${item.name} (${item.quantity}x ${formatCurrency(item.unitPrice)})`).join("; ")
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const openAddExpenseModal = () => {
    setEditingExpense(null)
    setExpenseForm({
      category: "RENT",
      amount: "",
      description: "",
      date: new Date(),
      accountId: "",
      barberId: ""
    })
    setExpenseModalOpen(true)
  }

  const openEditExpenseModal = (expense: Expense) => {
    if (expense.category === "KASBON" && expense.salaryDebtId) {
      alert("Kasbon tidak bisa diedit. Jika ada kesalahan, buat pembatalan terpisah.")
      return
    }
    setEditingExpense(expense)
    setExpenseForm({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      accountId: expense.accountId || "",
      barberId: expense.barberId || ""
    })
    setExpenseModalOpen(true)
  }

  const handleExpenseSubmit = async () => {
    if (!expenseForm.category || !expenseForm.amount || !expenseForm.description) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    if (expenseForm.category === "KASBON") {
      if (!expenseForm.barberId) {
        alert("Pilih barber untuk kasbon")
        return
      }
      if (!expenseForm.accountId) {
        alert("Pilih akun kas untuk kasbon")
        return
      }
    }

    try {
      if (editingExpense) {
        if (expenseForm.category === "KASBON") {
          await convertExpenseToKasbon({
            expenseId: editingExpense.id,
            barberId: expenseForm.barberId
          })
          alert("Pengeluaran berhasil dikonversi menjadi kasbon")
        } else {
        await updateExpense({
          id: editingExpense.id,
          title: expenseForm.description,
          amount: expenseForm.amount,
          category: expenseForm.category,
          date: expenseForm.date,
          accountId: expenseForm.accountId || undefined
        })
        alert("Pengeluaran berhasil diperbarui")
        }
      } else {
        await createExpense({
          title: expenseForm.description,
          amount: expenseForm.amount,
          category: expenseForm.category,
          date: expenseForm.date,
          accountId: expenseForm.accountId || undefined,
          barberId: expenseForm.category === "KASBON" ? expenseForm.barberId : undefined
        })
        alert("Pengeluaran berhasil ditambahkan")
      }

      setExpenseModalOpen(false)
      setEditingExpense(null)
      setExpenseForm({
        category: "RENT",
        amount: "",
        description: "",
        date: new Date(),
        accountId: "",
        barberId: ""
      })
      loadExpenses()
    } catch (error) {
      logError("Transactions", "Gagal menyimpan pengeluaran", error)
      alert(error instanceof Error ? error.message : "Gagal menyimpan pengeluaran")
    }
  }

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return

    try {
      await deleteExpense(deletingExpense.id)
      alert("Pengeluaran berhasil dihapus")
      setDeleteDialogOpen(false)
      setDeletingExpense(null)
      loadExpenses()
    } catch (error) {
      logError("Transactions", "Error deleting expense", error)
      alert(error instanceof Error ? error.message : "Gagal menghapus pengeluaran")
    }
  }

  const exportExpensesToCSV = () => {
    const headers = ["ID", "Tanggal", "Kategori", "Deskripsi", "Jumlah"]
    const rows = expenses.map(e => [
      e.id,
      new Date(e.date).toLocaleString("id-ID"),
      e.category,
      e.description,
      e.amount
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `expenses_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCategoryLabel = (value: string) => {
    const category = expenseCategories.find(cat => cat.value === value)
    return category ? category.label : value
  }

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Transaksi</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Kelola transaksi dan pengeluaran</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "transactions" | "expenses")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="text-sm">Transaksi</TabsTrigger>
            <TabsTrigger value="expenses" className="text-sm">Pengeluaran</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4 sm:mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  Filter Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <Label>Periode Tanggal</Label>
                      <Select value={selectedRange} onValueChange={handleRangeChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Barber</Label>
                      <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Semua Barber" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Barber</SelectItem>
                          {barbers.map((barber) => (
                            <SelectItem key={barber.id} value={barber.id}>
                              {barber.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Kasir</Label>
                      <Select value={selectedCashier} onValueChange={setSelectedCashier}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Semua Kasir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kasir</SelectItem>
                          {cashiers.map((cashier) => (
                            <SelectItem key={cashier.id} value={cashier.id}>
                              {cashier.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Metode Pembayaran</Label>
                      <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="TUNAI">Tunai</SelectItem>
                          <SelectItem value="QRIS">QRIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {showCustomPicker && (
                      <>
                        <div>
                          <Label>Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={customStartDate ? customStartDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => {
                              const [year, month, day] = e.target.value.split("-").map(Number)
                              setCustomStartDate(new Date(year, month - 1, day, 0, 0, 0))
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Tanggal Akhir</Label>
                          <Input
                            type="date"
                            value={customEndDate ? customEndDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => {
                              const [year, month, day] = e.target.value.split("-").map(Number)
                              setCustomEndDate(new Date(year, month - 1, day, 23, 59, 59))
                            }}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <Label>Pencarian</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari nama barber, kasir, atau item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 sm:mt-6 shadow-sm">
              <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-3">
                <CardTitle className="text-base sm:text-lg">Daftar Transaksi ({pagination.totalCount})</CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 h-8 px-2 sm:h-9 sm:px-4">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Memuat transaksi...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada transaksi yang ditemukan</div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No. Transaksi</TableHead>
                            <TableHead className="w-[180px]">Tanggal</TableHead>
                            <TableHead>Barber</TableHead>
                            <TableHead>Kasir</TableHead>
                            <TableHead>Metode Pembayaran</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Komisi</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-xs sm:text-sm font-medium">
                                {new Date(transaction.date).toISOString().split('T')[0]} {String(transaction.transactionNumber).padStart(2, '0')}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatDate(transaction.date)}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {transaction.barberName}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {transaction.cashierName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={transaction.paymentMethod === "TUNAI" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {transaction.paymentMethod}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-xs sm:text-sm">
                                {formatCurrency(transaction.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right text-xs sm:text-sm">
                                {formatCurrency(transaction.totalCommission)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetail(transaction)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {transactions.map((transaction) => (
                        <Card key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewDetail(transaction)}>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                {new Date(transaction.date).toISOString().split('T')[0]} {String(transaction.transactionNumber).padStart(2, '0')}
                              </p>
                              <p className="text-sm font-semibold mt-1 truncate">{transaction.barberName}</p>
                              <p className="text-xs text-muted-foreground">{transaction.cashierName}</p>
                            </div>
                            <Badge
                              variant={transaction.paymentMethod === "TUNAI" ? "default" : "secondary"}
                              className="text-xs shrink-0"
                            >
                              {transaction.paymentMethod}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="text-sm font-bold">{formatCurrency(transaction.totalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Komisi</p>
                              <p className="text-sm font-medium text-yellow-600">{formatCurrency(transaction.totalCommission)}</p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3 pt-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetail(transaction)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {pagination.totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Tampilkan</span>
                          <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                          <span>dari {pagination.totalCount} transaksi</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage || loading}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                              let pageNum: number
                              if (pagination.totalPages <= 5) {
                                pageNum = i + 1
                              } else if (pagination.page <= 3) {
                                pageNum = i + 1
                              } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i
                              } else {
                                pageNum = pagination.page - 2 + i
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === pagination.page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage || loading}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Halaman {pagination.page} dari {pagination.totalPages}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4 sm:mt-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  Filter Pengeluaran
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Periode Tanggal</Label>
                      <Select value={selectedRange} onValueChange={handleRangeChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Kategori</Label>
                      <Select value={selectedExpenseCategory} onValueChange={setSelectedExpenseCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showCustomPicker && (
                      <>
                        <div>
                          <Label>Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={customStartDate ? customStartDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Tanggal Akhir</Label>
                          <Input
                            type="date"
                            value={customEndDate ? customEndDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <Label>Pencarian</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari deskripsi atau kategori..."
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 sm:mt-6 shadow-sm">
              <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-3">
                <CardTitle className="text-base sm:text-lg">Daftar Pengeluaran ({expensePagination.totalCount})</CardTitle>
                <div className="flex gap-1 sm:gap-2">
                  <Button onClick={exportExpensesToCSV} variant="outline" size="sm" className="gap-2 h-8 px-2 sm:h-9 sm:px-4">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                  <Button onClick={openAddExpenseModal} size="sm" className="gap-2 h-8 px-2 sm:h-9 sm:px-4">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada pengeluaran yang ditemukan</div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">Tanggal</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell className="text-xs sm:text-sm">
                                {formatDate(expense.date)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryLabel(expense.category)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {expense.category === "KASBON" && expense.barberName
                                  ? `${expense.description} (${expense.barberName})`
                                  : expense.description}
                              </TableCell>
                              <TableCell className="text-right font-medium text-xs sm:text-sm text-red-600">
                                {formatCurrency(expense.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditExpenseModal(expense)}
                                    className="h-8 w-8 p-0"
                                    disabled={expense.category === "KASBON" && !!expense.salaryDebtId}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (expense.category === "KASBON") {
                                        alert("Kasbon tidak bisa dihapus. Buat pembatalan terpisah bila diperlukan.")
                                        return
                                      }
                                      setDeletingExpense(expense)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    disabled={expense.category === "KASBON"}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {expenses.map((expense) => (
                        <Card key={expense.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="text-xs mb-1">
                                {getCategoryLabel(expense.category)}
                              </Badge>
                              <p className="text-sm font-medium truncate">{expense.description}</p>
                              {expense.category === "KASBON" && expense.barberName && (
                                <p className="text-xs text-muted-foreground truncate">{expense.barberName}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(expense.date)}</p>
                            </div>
                            <p className="text-sm font-bold text-red-600 shrink-0">{formatCurrency(expense.amount)}</p>
                          </div>
                          <div className="flex justify-end gap-2 pt-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditExpenseModal(expense)}
                              className="h-8 w-8 p-0"
                              disabled={expense.category === "KASBON" && !!expense.salaryDebtId}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (expense.category === "KASBON") {
                                  alert("Kasbon tidak bisa dihapus. Buat pembatalan terpisah bila diperlukan.")
                                  return
                                }
                                setDeletingExpense(expense)
                                setDeleteDialogOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              disabled={expense.category === "KASBON"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {expensePagination.totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Tampilkan</span>
                          <Select value={String(expensePagination.pageSize)} onValueChange={handleExpensePageSizeChange}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                          <span>dari {expensePagination.totalCount} pengeluaran</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExpensePageChange(expensePagination.page - 1)}
                            disabled={!expensePagination.hasPrevPage}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, expensePagination.totalPages) }, (_, i) => {
                              let pageNum: number
                              if (expensePagination.totalPages <= 5) {
                                pageNum = i + 1
                              } else if (expensePagination.page <= 3) {
                                pageNum = i + 1
                              } else if (expensePagination.page >= expensePagination.totalPages - 2) {
                                pageNum = expensePagination.totalPages - 4 + i
                              } else {
                                pageNum = expensePagination.page - 2 + i
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === expensePagination.page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleExpensePageChange(pageNum)}
                                  className="h-8 w-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExpensePageChange(expensePagination.page + 1)}
                            disabled={!expensePagination.hasNextPage}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Halaman {expensePagination.page} dari {expensePagination.totalPages}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ID Transaksi</Label>
                  <p className="text-sm font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Tanggal</Label>
                  <p className="text-sm">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Barber</Label>
                  <p className="text-sm">{selectedTransaction.barberName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Kasir</Label>
                  <p className="text-sm">{selectedTransaction.cashierName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Metode Pembayaran</Label>
                  <p className="text-sm">{selectedTransaction.paymentMethod}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Item Transaksi</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">
                            <Badge variant="outline" className="mr-2 text-xs">
                              {item.type}
                            </Badge>
                            {item.name}
                          </TableCell>
                          <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right text-sm">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-muted-foreground">Total</Label>
                  <p className="text-2xl font-bold">{formatCurrency(selectedTransaction.totalAmount)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Komisi</Label>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(selectedTransaction.totalCommission)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenseDate">Tanggal</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseForm.date ? expenseForm.date.toISOString().split("T")[0] : ""}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: new Date(e.target.value) })}
                disabled={!!editingExpense && expenseForm.category === "KASBON"}
              />
            </div>
            <div>
              <Label htmlFor="expenseCategory">Kategori</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value: "RENT" | "UTILITIES" | "SUPPLIES" | "KASBON" | "OTHER") =>
                  setExpenseForm({ ...expenseForm, category: value })
                }
              >
                <SelectTrigger id="expenseCategory">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expenseAccount">Akun Kas</Label>
              <Select value={expenseForm.accountId} onValueChange={(value: string) => setExpenseForm({ ...expenseForm, accountId: value })}>
                <SelectTrigger id="expenseAccount">
                  <SelectValue placeholder={expenseForm.category === "KASBON" ? "Pilih akun kas *" : "Pilih akun kas (opsional)"} />
                </SelectTrigger>
                <SelectContent>
                  {cashAccounts.filter(acc => acc.isActive).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type}) - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {expenseForm.category === "KASBON" && (
              <div>
                <Label>Barber</Label>
                <Select value={expenseForm.barberId} onValueChange={(value: string) => setExpenseForm({ ...expenseForm, barberId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barber *" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.filter(b => b.name && b.id).map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="expenseAmount">Jumlah</Label>
              <Input
                id="expenseAmount"
                type="number"
                placeholder="Masukkan jumlah"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                disabled={!!editingExpense && expenseForm.category === "KASBON"}
              />
            </div>
            <div>
              <Label htmlFor="expenseDescription">Deskripsi</Label>
              <Input
                id="expenseDescription"
                placeholder="Masukkan deskripsi"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                disabled={!!editingExpense && expenseForm.category === "KASBON"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleExpenseSubmit}>
              {editingExpense ? (expenseForm.category === "KASBON" ? "Konversi" : "Simpan") : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengeluaran</DialogTitle>
          </DialogHeader>
          <p>
            Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


