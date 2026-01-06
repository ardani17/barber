"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import {
  createExpense,
  updateExpense,
  deleteExpense
} from "@/actions/expenses"

interface Expense {
  id: string
  date: Date
  category: "RENT" | "UTILITIES" | "SUPPLIES" | "OTHER"
  amount: number
  description: string
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

interface ExpensesTableProps {
  expenses: Expense[]
  cashAccounts: CashAccount[]
  selectedCategory: string
  searchQuery: string
}

export default function ExpensesTable({
  expenses,
  cashAccounts,
  selectedCategory,
  searchQuery
}: ExpensesTableProps) {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState<{
    category: "RENT" | "UTILITIES" | "SUPPLIES" | "OTHER"
    amount: string
    description: string
    date: Date
    accountId: string
  }>({
    category: "RENT",
    amount: "",
    description: "",
    date: new Date(),
    accountId: ""
  })
  const [loading, setLoading] = useState(false)
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [localCategory, setLocalCategory] = useState(selectedCategory)

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setExpenseForm({
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description,
        date: expense.date,
        accountId: ""
      })
    } else {
      setEditingExpense(null)
      setExpenseForm({
        category: "RENT",
        amount: "",
        description: "",
        date: new Date(),
        accountId: ""
      })
    }
    setExpenseModalOpen(true)
  }

  const handleCloseModal = () => {
    setExpenseModalOpen(false)
    setEditingExpense(null)
    setExpenseForm({
      category: "RENT",
      amount: "",
      description: "",
      date: new Date(),
      accountId: ""
    })
  }

  const handleSubmit = async () => {
    if (!expenseForm.description.trim()) {
      alert("Deskripsi harus diisi")
      return
    }

    if (!expenseForm.amount.trim()) {
      alert("Jumlah harus diisi")
      return
    }

    try {
      setLoading(true)

      const expenseData = {
        category: expenseForm.category,
        amount: expenseForm.amount,
        title: expenseForm.description,
        date: expenseForm.date,
        accountId: expenseForm.accountId
      }

      if (editingExpense) {
        const updatedExpense = await updateExpense({
          id: editingExpense.id,
          ...expenseData
        })
        if (updatedExpense) {
          setLocalExpenses(
            localExpenses.map(expense =>
              expense.id === editingExpense.id
                ? {
                    ...expense,
                    category: updatedExpense.category,
                    amount: parseFloat(updatedExpense.amount),
                    description: updatedExpense.description,
                    date: updatedExpense.date
                  }
                : expense
            )
          )
        }
      } else {
        const newExpense = await createExpense(expenseData)
        if (newExpense) {
          setLocalExpenses([
            ...localExpenses,
            {
              id: newExpense.id,
              date: newExpense.date,
              category: newExpense.category,
              amount: parseFloat(newExpense.amount),
              description: newExpense.description,
              cashAccountName: "",
              cashAccountType: ""
            }
          ])
        }
      }

      handleCloseModal()
    } catch (error) {
      console.error("Error saving expense:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingExpense) return

    try {
      setLoading(true)
      await deleteExpense(deletingExpense.id)
      setLocalExpenses(localExpenses.filter(expense => expense.id !== deletingExpense.id))
      setDeleteDialogOpen(false)
      setDeletingExpense(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = localExpenses.filter(expense => {
    const matchesCategory = localCategory === "all" || expense.category === localCategory
    const matchesSearch = localSearchQuery === "" || 
      expense.description.toLowerCase().includes(localSearchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pencarian</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari pengeluaran..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={localCategory} onValueChange={setLocalCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    <SelectItem value="RENT">Sewa</SelectItem>
                    <SelectItem value="UTILITIES">Utilitas</SelectItem>
                    <SelectItem value="SUPPLIES">Perlengkapan</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => handleOpenModal()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengeluaran
                </Button>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Akun</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada data pengeluaran
                      </TableCell>
                    </TableRow>
                    ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.cashAccountName}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.cashAccountType}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={expenseModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "Edit detail pengeluaran yang ada"
                : "Tambahkan pengeluaran baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value: any) =>
                  setExpenseForm({ ...expenseForm, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Sewa</SelectItem>
                  <SelectItem value="UTILITIES">Utilitas</SelectItem>
                  <SelectItem value="SUPPLIES">Perlengkapan</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                placeholder="Masukkan jumlah pengeluaran"
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
                placeholder="Masukkan deskripsi pengeluaran"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={expenseForm.date.toISOString().split("T")[0]}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    date: new Date(e.target.value)
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Akun Kas</Label>
              <Select
                value={expenseForm.accountId}
                onValueChange={(value) =>
                  setExpenseForm({ ...expenseForm, accountId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun kas" />
                </SelectTrigger>
                <SelectContent>
                  {cashAccounts
                    .filter((acc) => acc.isActive)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : editingExpense ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengeluaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingExpense(null)
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
