import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Search, Filter, Download } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import {
  getTransactions,
  getBarbers,
  getCashiers
} from "@/actions/transactions"
import {
  getExpenses
} from "@/actions/expenses"
import { getCashAccounts } from "@/actions/cashflow"
import TransactionsTable from "./transactions-table"
import ExpensesTable from "./expenses-table"
import TransactionsFilter from "./transactions-filter"
import ExpensesFilter from "./expenses-filter"
import TransactionDetailModal from "./transaction-detail-modal"

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
  category: "RENT" | "UTILITIES" | "SUPPLIES" | "OTHER"
  amount: number
  description: string
  accountId?: string | null
  accountName?: string | null
  cashAccountName: string
  cashAccountType: string
}

interface CashAccount {
  id: string
  name: string
  type: string
  balance: string
  isActive: boolean
}

interface PageProps {
  searchParams: {
    range?: string
    startDate?: string
    endDate?: string
    barber?: string
    cashier?: string
    paymentMethod?: string
    search?: string
    category?: string
    expenseSearch?: string
  }
}

async function getDateRange(range: string, startDate?: string, endDate?: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (range === "custom" && startDate && endDate) {
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
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

async function TransactionsPage({ searchParams }: PageProps) {
  const range = searchParams.range || "today"
  const { startDate, endDate } = await getDateRange(
    range,
    searchParams.startDate,
    searchParams.endDate
  )

  const barberId = searchParams.barber === "all" ? undefined : searchParams.barber
  const cashierId = searchParams.cashier === "all" ? undefined : searchParams.cashier
  const paymentMethod = searchParams.paymentMethod === "all" ? undefined : searchParams.paymentMethod as "TUNAI" | "QRIS"
  const search = searchParams.search || undefined

  const category = searchParams.category === "all" ? undefined : searchParams.category
  const expenseSearch = searchParams.expenseSearch || undefined

  const [transactions, barbers, cashiers, expenses, cashAccounts] = await Promise.all([
    getTransactions({
      startDate,
      endDate,
      barberId,
      cashierId,
      paymentMethod,
      search
    }),
    getBarbers(),
    getCashiers(),
    getExpenses({
      startDate,
      endDate,
      category: category as any,
      search: expenseSearch
    }),
    getCashAccounts()
  ])

  const transformedExpenses: Expense[] = expenses.map(expense => ({
    id: expense.id,
    date: expense.date,
    category: expense.category,
    amount: parseFloat(expense.amount),
    description: expense.description,
    accountId: expense.accountId,
    accountName: expense.accountName,
    cashAccountName: expense.accountName || "",
    cashAccountType: ""
  }))

  const transformedCashAccounts: CashAccount[] = cashAccounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    isActive: account.isActive
  }))

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Transaksi</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Kelola transaksi dan pengeluaran</p>
        </div>

        <Tabs defaultValue="transactions" className="w-full" suppressHydrationWarning>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="text-sm" suppressHydrationWarning>Transaksi</TabsTrigger>
            <TabsTrigger value="expenses" className="text-sm" suppressHydrationWarning>Pengeluaran</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4 sm:mt-6" suppressHydrationWarning>
            <TransactionsFilter
              range={range}
              barbers={barbers}
              cashiers={cashiers}
              selectedBarber={searchParams.barber || "all"}
              selectedCashier={searchParams.cashier || "all"}
              selectedPaymentMethod={searchParams.paymentMethod || "all"}
              searchQuery={searchParams.search || ""}
              startDate={searchParams.startDate}
              endDate={searchParams.endDate}
            />

            <TransactionsTable
              transactions={transactions}
              barbers={barbers}
              cashiers={cashiers}
              selectedBarber={searchParams.barber || "all"}
              selectedCashier={searchParams.cashier || "all"}
              selectedPaymentMethod={searchParams.paymentMethod || "all"}
              searchQuery={searchParams.search || ""}
            />
          </TabsContent>

          <TabsContent value="expenses" className="mt-4 sm:mt-6" suppressHydrationWarning>
            <ExpensesFilter
              range={range}
              selectedCategory={searchParams.category || "all"}
              searchQuery={searchParams.expenseSearch || ""}
              startDate={searchParams.startDate}
              endDate={searchParams.endDate}
            />

            <ExpensesTable
              expenses={transformedExpenses}
              cashAccounts={transformedCashAccounts}
              selectedCategory={searchParams.category || "all"}
              searchQuery={searchParams.expenseSearch || ""}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TransactionsPage
