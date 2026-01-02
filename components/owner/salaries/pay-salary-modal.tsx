"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CashAccount, PaymentData } from "@/types"
import { formatCurrency } from "@/lib/decimal"

interface PaySalaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryData: PaymentData | null
  cashAccounts: CashAccount[]
  onSubmit: (data: {
    cashAccountId: string
    qrisAccountId: string
    cashAmount: string
    qrisAmount: string
    notes: string
  }) => Promise<void>
}

export function PaySalaryModal({
  open,
  onOpenChange,
  salaryData,
  cashAccounts,
  onSubmit
}: PaySalaryModalProps) {
  const [form, setForm] = useState({
    cashAccountId: "",
    qrisAccountId: "",
    cashAmount: "",
    qrisAmount: "",
    manualTotalAmount: "",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (salaryData && open) {
      setForm({
        cashAccountId: "",
        qrisAccountId: "",
        cashAmount: salaryData.totalAmount,
        qrisAmount: "",
        manualTotalAmount: salaryData.totalAmount,
        notes: ""
      })
      setError(null)
    }
  }, [salaryData, open])

  const handleSubmit = async () => {
    if (!salaryData) {
      setError("Data pembayaran tidak ditemukan")
      return
    }

    const cashAmount = parseFloat(form.cashAmount) || 0
    const qrisAmount = parseFloat(form.qrisAmount) || 0
    const totalAmount = parseFloat(salaryData.totalAmount)

    if (cashAmount + qrisAmount !== totalAmount) {
      setError(`Total pembayaran (Rp ${(cashAmount + qrisAmount).toLocaleString()}) harus sama dengan total gaji (Rp ${totalAmount.toLocaleString()})`)
      return
    }

    if (cashAmount > 0 && !form.cashAccountId) {
      setError("Pilih akun cash untuk pembayaran tunai")
      return
    }

    if (qrisAmount > 0 && !form.qrisAccountId) {
      setError("Pilih akun QRIS untuk pembayaran via QRIS")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await onSubmit({
        cashAccountId: form.cashAccountId,
        qrisAccountId: form.qrisAccountId,
        cashAmount: form.cashAmount || "0",
        qrisAmount: form.qrisAmount || "0",
        notes: form.notes
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pembayaran gaji")
    } finally {
      setSubmitting(false)
    }
  }

  if (!salaryData) return null

  const cashAccountsList = cashAccounts.filter(a => a.type === "CASH")
  const qrisAccountsList = cashAccounts.filter(a => a.type === "QRIS")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bayar Gaji - {salaryData.barberName}</DialogTitle>
          <DialogDescription>
            Periode: {new Date(salaryData.periodStart).toLocaleDateString("id-ID")} - {new Date(salaryData.periodEnd).toLocaleDateString("id-ID")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Gaji Pokok</Label>
              <p className="text-lg font-semibold">{formatCurrency(salaryData.baseSalaryAmount)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Komisi</Label>
              <p className="text-lg font-semibold">{formatCurrency(salaryData.commissionAmount)}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Total yang harus dibayar</Label>
              <p className="text-xl font-bold text-primary">{formatCurrency(salaryData.totalAmount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Jumlah Cash</Label>
              <Input
                type="number"
                value={form.cashAmount}
                onChange={(e) => setForm({ ...form, cashAmount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Akun Cash</Label>
              <Select value={form.cashAccountId} onValueChange={(value) => setForm({ ...form, cashAccountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  {cashAccountsList.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah QRIS</Label>
              <Input
                type="number"
                value={form.qrisAmount}
                onChange={(e) => setForm({ ...form, qrisAmount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Akun QRIS</Label>
              <Select value={form.qrisAccountId} onValueChange={(value) => setForm({ ...form, qrisAccountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  {qrisAccountsList.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Catatan (Opsional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Catatan pembayaran"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Memproses..." : "Bayar Gaji"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
