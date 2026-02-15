"use client"

import { useState, useEffect } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Wallet, ArrowRightLeft, Plus, Edit, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Building2, Smartphone, Banknote } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import {
  createCashAccount,
  updateCashAccount,
  deleteCashAccount,
  toggleCashAccountActive,
  getCashAccounts,
  createTransaction,
  createTransfer,
  getCashTransactions,
  getCashflowSummary,
  setDefaultAccount,
  getAllTransactions
} from "@/actions/cashflow"

type AccountType = "TUNAI" | "BANK" | "QRIS"

interface CashAccount {
  id: string
  name: string
  type: AccountType
  balance: string
  accountNumber?: string | null
  isActive: boolean
  isDefault: boolean
}

type TransactionType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"

type DepositWithdrawType = "DEPOSIT" | "WITHDRAW"

interface CashTransaction {
  id: string
  accountId: string
  fromAccountId?: string | null
  toAccountId?: string | null
  type: TransactionType
  amount: string
  description: string
  date: string
}

interface CashflowSummary {
  totalBalance: string
  totalAccounts: number
  totalTransactions: number
  cashBalance: string
  bankBalance: string
  qrisBalance: string
}

type TransactionSource = "CASH_TRANSACTION" | "EXPENSE" | "POS_TRANSACTION"

interface UnifiedTransaction {
  id: string
  date: string
  amount: string
  description: string
  type: string
  source: TransactionSource
  accountName?: string
  fromAccountName?: string
  toAccountName?: string
  barberName?: string
  cashierName?: string
  isIncome: boolean
}

const accountTypeIcons: Record<AccountType, { icon: any; color: string }> = {
  TUNAI: { icon: Banknote, color: "text-green-600" },
  BANK: { icon: Building2, color: "text-blue-600" },
  QRIS: { icon: Smartphone, color: "text-purple-600" }
}

export default function CashflowPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [accounts, setAccounts] = useState<CashAccount[]>([])
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([])
  const [summary, setSummary] = useState<CashflowSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null)

  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "TUNAI" as AccountType,
    initialBalance: "",
    accountNumber: ""
  })

  const [transactionForm, setTransactionForm] = useState({
    accountId: "",
    type: "DEPOSIT" as DepositWithdrawType,
    amount: "",
    description: ""
  })

  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [accountsData, transactionsData, summaryData] = await Promise.all([
        getCashAccounts(),
        getAllTransactions(),
        getCashflowSummary()
      ])
      
      setAccounts(accountsData)
      setTransactions(transactionsData)
      setSummary(summaryData)
    } catch (error) {
      logError("Cashflow", "Error loading data", error)
    } finally {
      setLoading(false)
    }
  }

  const openAddAccountModal = () => {
    setEditingAccount(null)
    setAccountForm({
      name: "",
      type: "TUNAI",
      initialBalance: "",
      accountNumber: ""
    })
    setAccountModalOpen(true)
  }

  const openEditAccountModal = (account: CashAccount) => {
    setEditingAccount(account)
    setAccountForm({
      name: account.name,
      type: account.type,
      initialBalance: account.balance,
      accountNumber: account.accountNumber || ""
    })
    setAccountModalOpen(true)
  }

  const handleAccountSubmit = async () => {
    if (!accountForm.name || !accountForm.initialBalance) {
      alert("Mohon lengkapi nama dan saldo awal akun")
      return
    }

    try {
      if (editingAccount) {
        await updateCashAccount({
          id: editingAccount.id,
          name: accountForm.name,
          type: accountForm.type,
          accountNumber: accountForm.accountNumber || undefined
        })
        alert("Akun berhasil diperbarui")
      } else {
        await createCashAccount({
          name: accountForm.name,
          type: accountForm.type,
          initialBalance: accountForm.initialBalance,
          accountNumber: accountForm.accountNumber || undefined
        })
        alert("Akun berhasil ditambahkan")
      }

      setAccountModalOpen(false)
      setEditingAccount(null)
      loadData()
    } catch (error) {
      logError("Cashflow", "Gagal menyimpan akun", error)
      alert("Gagal menyimpan akun")
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini? Saldo akan hangus.")) {
      try {
        await deleteCashAccount(accountId)
        alert("Akun berhasil dihapus")
        loadData()
      } catch (error) {
        logError("Cashflow", "Gagal menghapus akun", error)
        alert("Gagal menghapus akun")
      }
    }
  }

  const handleToggleActive = async (accountId: string) => {
    try {
      await toggleCashAccountActive(accountId)
      loadData()
    } catch (error) {
      logError("Cashflow", "Gagal mengubah status akun", error)
      alert("Gagal mengubah status akun")
    }
  }

  const handleSetDefaultAccount = async (accountId: string) => {
    try {
      await setDefaultAccount(accountId)
      alert("Akun default berhasil diubah")
      loadData()
    } catch (error) {
      logError("Cashflow", "Gagal mengubah akun default", error)
      alert("Gagal mengubah akun default")
    }
  }

  const openTransactionModal = () => {
    setTransactionForm({
      accountId: "",
      type: "DEPOSIT",
      amount: "",
      description: ""
    })
    setTransactionModalOpen(true)
  }

  const handleTransactionSubmit = async () => {
    if (!transactionForm.accountId || !transactionForm.amount) {
      alert("Mohon lengkapi akun dan jumlah transaksi")
      return
    }

    try {
      await createTransaction({
        accountId: transactionForm.accountId,
        type: transactionForm.type,
        amount: transactionForm.amount,
        description: transactionForm.description || ""
      })

      setTransactionModalOpen(false)
      alert("Transaksi berhasil")
      loadData()
    } catch (error) {
      logError("Cashflow", "Gagal membuat transaksi", error)
      alert("Gagal membuat transaksi")
    }
  }

  const openTransferModal = () => {
    setTransferForm({
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      description: ""
    })
    setTransferModalOpen(true)
  }

  const handleTransferSubmit = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
      alert("Mohon lengkapi semua field transfer")
      return
    }

    if (transferForm.fromAccountId === transferForm.toAccountId) {
      alert("Akun pengirim dan penerima tidak boleh sama")
      return
    }

    try {
      await createTransfer({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: transferForm.amount,
        description: transferForm.description || "Transfer"
      })

      setTransferModalOpen(false)
      alert("Transfer berhasil")
      loadData()
    } catch (error) {
      logError("Cashflow", "Gagal membuat transfer", error)
      alert("Gagal membuat transfer")
    }
  }

  const totalBalance = summary ? parseFloat(summary.totalBalance) : 0

  return (
    <div className="min-h-screen bg-muted p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Cashflow</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">Kelola saldo dan transaksi kas barber</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 h-8 sm:h-10 text-xs sm:text-xs">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="accounts">Akun Kas</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-xl sm:text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                        {formatCurrency(totalBalance)}
                      </div>
                      <div className="flex items-center text-xs sm:text-xs text-green-600 mt-1 sm:mt-2">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span>Saldo total semua akun</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Kas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-xl sm:text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                        {summary ? formatCurrency(summary.cashBalance) : formatCurrency(0)}
                      </div>
                      <div className="flex items-center text-xs sm:text-xs text-green-600 mt-1 sm:mt-2">
                        <Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span>Akun Tunai</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Bank</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-xl sm:text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                        {summary ? formatCurrency(summary.bankBalance) : formatCurrency(0)}
                      </div>
                      <div className="flex items-center text-xs sm:text-xs text-blue-600 mt-1 sm:mt-2">
                        <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span>Akun Bank</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo QRIS</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-xl sm:text-2xl font-bold">Loading...</div>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                        {summary ? formatCurrency(summary.qrisBalance) : formatCurrency(0)}
                      </div>
                      <div className="flex items-center text-xs sm:text-xs text-purple-600 mt-1 sm:mt-2">
                        <Smartphone className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span>Akun QRIS</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm">Akun Kas Aktif</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  {loading ? (
                    <div className="text-center py-3 sm:py-4 text-xs sm:text-sm">Loading...</div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {accounts.filter(a => a.isActive).slice(0, 5).map((account) => {
                        const Icon = accountTypeIcons[account.type].icon
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${accountTypeIcons[account.type].color}`}>
                                <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                              </div>
                              <div>
                                <div className="font-medium text-xs sm:text-sm">{account.name}</div>
                                <div className="text-xs sm:text-xs text-muted-foreground">
                                  {account.type}
                                  {account.accountNumber && ` - ${account.accountNumber}`}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-xs sm:text-sm">
                              {formatCurrency(parseFloat(account.balance))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm">Transaksi Terakhir</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  {loading ? (
                    <div className="text-center py-3 sm:py-4 text-xs sm:text-sm">Loading...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">
                      Belum ada transaksi
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {transactions.slice(0, 5).map((transaction) => {
                        const isIncome = transaction.isIncome
                        let icon
                        let bgColor
                        let iconColor

                        if (transaction.source === "CASH_TRANSACTION") {
                          if (transaction.type === "TRANSFER") {
                            icon = <ArrowRightLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            bgColor = "bg-blue-100"
                            iconColor = "text-blue-600"
                          } else {
                            icon = isIncome ? <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" /> : <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            bgColor = isIncome ? "bg-green-100" : "bg-red-100"
                            iconColor = isIncome ? "text-green-600" : "text-red-600"
                          }
                        } else if (transaction.source === "EXPENSE") {
                          icon = <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                          bgColor = "bg-red-100"
                          iconColor = "text-red-600"
                        } else if (transaction.source === "POS_TRANSACTION") {
                          icon = <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                          bgColor = "bg-green-100"
                          iconColor = "text-green-600"
                        }

                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`p-1.5 sm:p-2 rounded-lg ${bgColor} ${iconColor}`}>
                                {icon}
                              </div>
                              <div>
                                <div className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{transaction.description}</div>
                                <div className="text-xs sm:text-xs text-muted-foreground">
                                  {transaction.source === "CASH_TRANSACTION" && transaction.accountName && `${transaction.accountName} • ${transaction.type}`}
                                  {transaction.source === "EXPENSE" && `Pengeluaran • ${transaction.type}`}
                                  {transaction.source === "POS_TRANSACTION" && `POS • ${transaction.type}`}
                                </div>
                              </div>
                            </div>
                            <div className={`font-bold text-xs sm:text-xs ${isIncome ? "text-green-600" : "text-red-600"}`}>
                              {isIncome ? "+" : "-"}
                              {formatCurrency(parseFloat(transaction.amount))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">Daftar Akun Kas</h2>
              <Button onClick={openAddAccountModal} className="bg-yellow-500 text-black hover:bg-yellow-600 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Tambah Akun
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-6 sm:py-8 text-xs sm:text-sm">Loading...</div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12 px-3 sm:px-6">
                  <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">Belum ada akun kas</p>
                  <Button onClick={openAddAccountModal} className="bg-yellow-500 text-black hover:bg-yellow-600 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Buat Akun Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-sm hidden sm:block">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-xs">Nama</TableHead>
                        <TableHead className="text-xs sm:text-xs">Tipe</TableHead>
                        <TableHead className="text-xs sm:text-xs hidden sm:table-cell">Nomor</TableHead>
                        <TableHead className="text-xs sm:text-xs">Saldo</TableHead>
                        <TableHead className="text-xs sm:text-xs hidden sm:table-cell">Status</TableHead>
                        <TableHead className="text-xs sm:text-xs hidden sm:table-cell">Default</TableHead>
                        <TableHead className="text-xs sm:text-xs text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => {
                        const Icon = accountTypeIcons[account.type].icon
                        return (
                          <TableRow key={account.id}>
                            <TableCell>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className={`p-1 sm:p-2 rounded-lg ${accountTypeIcons[account.type].color}`}>
                                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                </div>
                                <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]" title={account.name}>{account.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs sm:text-xs px-1.5 sm:px-2 py-0 sm:py-1">{account.type}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs sm:text-xs hidden sm:table-cell">
                              {account.accountNumber || "-"}
                            </TableCell>
                            <TableCell className="font-bold text-xs sm:text-xs">
                              {formatCurrency(parseFloat(account.balance))}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant={account.isActive ? "default" : "secondary"} className="text-xs sm:text-xs px-1.5 sm:px-2 py-0 sm:py-1">
                                {account.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {account.isDefault ? (
                                <Badge variant="default" className="bg-amber-500 text-amber-950 text-xs sm:text-xs px-1.5 sm:px-2 py-0 sm:py-1">
                                  Default
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetDefaultAccount(account.id)}
                                  className="text-xs sm:text-xs h-6 sm:h-auto px-1 sm:px-2 py-0 sm:py-auto"
                                >
                                  Set Default
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditAccountModal(account)}
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 h-6 w-6 sm:h-auto sm:w-auto p-0 sm:p-2"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleActive(account.id)}
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 h-6 w-6 sm:h-auto sm:w-auto p-0 sm:p-2 text-xs sm:text-xs"
                                >
                                  {account.isActive ? "Nonaktif" : "Aktif"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAccount(account.id)}
                                  className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 h-6 w-6 sm:h-auto sm:w-auto p-0 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="grid gap-3 sm:hidden">
                {accounts.map((account) => {
                  const Icon = accountTypeIcons[account.type].icon
                  return (
                    <div key={account.id} className="rounded-lg border border-yellow-500 dark:border-gray-700 p-3 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${accountTypeIcons[account.type].color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-xs truncate max-w-[120px]">{account.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">{account.type}</Badge>
                      </div>
                      <div className="text-sm font-bold mb-2">{formatCurrency(parseFloat(account.balance))}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant={account.isActive ? "default" : "secondary"} className={account.isActive ? "bg-green-600 text-white text-xs px-1.5 py-0.5" : "text-xs px-1.5 py-0.5"}>
                          {account.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEditAccountModal(account)} className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(account.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">Riwayat Transaksi</h2>
              <div className="flex gap-2">
                <Button onClick={openTransactionModal} className="bg-yellow-500 text-black hover:bg-yellow-600 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Transaksi Baru
                </Button>
                <Button onClick={openTransferModal} variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                  <ArrowRightLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Transfer
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6 sm:py-8 text-xs sm:text-sm">Loading...</div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12 px-3 sm:px-6">
                  <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">Belum ada transaksi</p>
                  <Button onClick={openTransactionModal} className="bg-yellow-500 text-black hover:bg-yellow-600 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Buat Transaksi Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-sm hidden sm:block">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-xs">Tanggal</TableHead>
                        <TableHead className="text-xs sm:text-xs">Sumber</TableHead>
                        <TableHead className="text-xs sm:text-xs hidden sm:table-cell">Tipe</TableHead>
                        <TableHead className="text-xs sm:text-xs">Deskripsi</TableHead>
                        <TableHead className="text-xs sm:text-xs">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const isIncome = transaction.isIncome
                        const sourceLabel = {
                          CASH_TRANSACTION: "Kas",
                          EXPENSE: "Pengeluaran",
                          POS_TRANSACTION: "POS"
                        }[transaction.source]

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-muted-foreground text-xs sm:text-xs">
                              {new Date(transaction.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs sm:text-xs px-1.5 sm:px-2 py-0 sm:py-1">{sourceLabel}</Badge>
                              {transaction.accountName && (
                                <div className="text-xs sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                  {transaction.accountName}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant={isIncome ? "default" : "destructive"} className="text-xs sm:text-xs px-1.5 sm:px-2 py-0 sm:py-1">
                                {transaction.source === "CASH_TRANSACTION" ? transaction.type : transaction.source === "EXPENSE" ? transaction.type : transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-xs truncate max-w-[100px] sm:max-w-[200px]">{transaction.description}</TableCell>
                            <TableCell className={`font-bold text-xs sm:text-xs ${isIncome ? "text-green-600" : "text-red-600"}`}>
                              {isIncome ? "+" : "-"}
                              {formatCurrency(parseFloat(transaction.amount))}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="grid gap-3 sm:hidden">
                {transactions.map((transaction) => {
                  const isIncome = transaction.isIncome
                  const sourceLabel = {
                    CASH_TRANSACTION: "Kas",
                    EXPENSE: "Pengeluaran",
                    POS_TRANSACTION: "POS"
                  }[transaction.source]
                  return (
                    <div key={transaction.id} className="rounded-lg border border-yellow-500 dark:border-gray-700 p-3 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs font-medium mt-1 truncate max-w-[180px]">{transaction.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">{sourceLabel}</Badge>
                      </div>
                      <div className={`text-sm font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={accountModalOpen} onOpenChange={setAccountModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{editingAccount ? "Edit Akun" : "Tambah Akun Baru"}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingAccount ? "Edit informasi akun kas" : "Buat akun kas baru untuk mengelola keuangan"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="accountName" className="text-xs sm:text-sm">Nama Akun</Label>
                <Input
                  id="accountName"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Contoh: Kas Utama, BCA, QRIS Tokopedia"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="accountType" className="text-xs sm:text-sm">Tipe Akun</Label>
                <Select
                  value={accountForm.type}
                  onValueChange={(value: AccountType) => setAccountForm({ ...accountForm, type: value })}
                >
                  <SelectTrigger id="accountType" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUNAI" className="text-xs sm:text-sm">Tunai</SelectItem>
                    <SelectItem value="BANK" className="text-xs sm:text-sm">Bank</SelectItem>
                    <SelectItem value="QRIS" className="text-xs sm:text-sm">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editingAccount && (
                <div>
                  <Label htmlFor="initialBalance" className="text-xs sm:text-sm">Saldo Awal</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    value={accountForm.initialBalance}
                    onChange={(e) => setAccountForm({ ...accountForm, initialBalance: e.target.value })}
                    placeholder="0"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              )}
              {accountForm.type !== "TUNAI" && (
                <div>
                  <Label htmlFor="accountNumber" className="text-xs sm:text-sm">Nomor Akun</Label>
                  <Input
                    id="accountNumber"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    placeholder="Contoh: 1234567890"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button variant="outline" onClick={() => setAccountModalOpen(false)} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                Batal
              </Button>
              <Button onClick={handleAccountSubmit} className="bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                {editingAccount ? "Simpan" : "Buat Akun"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Transaksi Baru</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Tambah transaksi pemasukan atau pengeluaran
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="transactionAccount" className="text-xs sm:text-sm">Akun</Label>
                <Select
                  value={transactionForm.accountId}
                  onValueChange={(value) => setTransactionForm({ ...transactionForm, accountId: value })}
                >
                  <SelectTrigger id="transactionAccount" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.isActive).map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs sm:text-sm">
                        {account.name} - {formatCurrency(parseFloat(account.balance))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transactionType" className="text-xs sm:text-sm">Tipe Transaksi</Label>
                <Select
                  value={transactionForm.type}
                  onValueChange={(value: DepositWithdrawType) => setTransactionForm({ ...transactionForm, type: value })}
                >
                  <SelectTrigger id="transactionType" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEPOSIT" className="text-xs sm:text-sm">Pemasukan</SelectItem>
                    <SelectItem value="WITHDRAW" className="text-xs sm:text-sm">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transactionAmount" className="text-xs sm:text-sm">Jumlah</Label>
                <Input
                  id="transactionAmount"
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  placeholder="0"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="transactionDescription" className="text-xs sm:text-sm">Deskripsi</Label>
                <Input
                  id="transactionDescription"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  placeholder="Contoh: Setoran harian, Pembayaran sewa"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button variant="outline" onClick={() => setTransactionModalOpen(false)} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                Batal
              </Button>
              <Button onClick={handleTransactionSubmit} className="bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                Buat Transaksi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Transfer Antar Akun</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Pindahkan saldo dari satu akun ke akun lain
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="fromAccount" className="text-xs sm:text-sm">Dari Akun</Label>
                <Select
                  value={transferForm.fromAccountId}
                  onValueChange={(value) => setTransferForm({ ...transferForm, fromAccountId: value })}
                >
                  <SelectTrigger id="fromAccount" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Pilih akun sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.isActive).map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs sm:text-sm">
                        {account.name} - {formatCurrency(parseFloat(account.balance))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="toAccount" className="text-xs sm:text-sm">Ke Akun</Label>
                <Select
                  value={transferForm.toAccountId}
                  onValueChange={(value) => setTransferForm({ ...transferForm, toAccountId: value })}
                >
                  <SelectTrigger id="toAccount" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Pilih akun tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.isActive).map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs sm:text-sm">
                        {account.name} - {formatCurrency(parseFloat(account.balance))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transferAmount" className="text-xs sm:text-sm">Jumlah Transfer</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  placeholder="0"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="transferDescription" className="text-xs sm:text-sm">Deskripsi</Label>
                <Input
                  id="transferDescription"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  placeholder="Contoh: Setoran ke bank"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button variant="outline" onClick={() => setTransferModalOpen(false)} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                Batal
              </Button>
              <Button onClick={handleTransferSubmit} className="bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
