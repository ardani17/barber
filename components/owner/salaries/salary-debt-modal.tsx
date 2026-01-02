"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Barber, SalaryDebt, CashAccount } from "@/types"

interface SalaryDebtModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "pay"
  debt?: SalaryDebt | null
  barbers: Barber[]
  cashAccounts: CashAccount[]
  onSubmit: (data: any) => Promise<void>
}

export function SalaryDebtModal({
  open,
  onOpenChange,
  mode,
  debt,
  barbers,
  cashAccounts,
  onSubmit
}: SalaryDebtModalProps) {
  const [form, setForm] = useState({
    barberId: "",
    amount: "",
    reason: "",
    debtId: "",
    cashAccountId: "",
    qrisAccountId: "",
    cashAmount: "",
    qrisAmount: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (mode === "pay" && debt) {
        setForm({
          barberId: "",
          amount: "",
          reason: "",
          debtId: debt.id,
          cashAccountId: "",
          qrisAccountId: "",
          cashAmount: debt.amount,
          qrisAmount: "0"
        })
      } else {
        setForm({
          barberId: "",
          amount: "",
          reason: "",
          debtId: "",
          cashAccountId: "",
          qrisAccountId: "",
          cashAmount: "",
          qrisAmount: ""
        })
      }
      setError(null)
    }
  }, [open, mode, debt])

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)

    try {
      if (mode === "add") {
        if (!form.barberId) {
          setError("Pilih barber terlebih dahulu")
          return
        }

        if (!form.amount || parseFloat(form.amount) <= 0) {
          setError("Masukkan jumlah hutang yang valid")
          return
        }

        if (!form.reason) {
          setError("Masukkan alasan hutang")
          return
        }

        await onSubmit({
          barberId: form.barberId,
          amount: form.amount,
          reason: form.reason
        })
      } else {
        const cashAmount = parseFloat(form.cashAmount) || 0
        const qrisAmount = parseFloat(form.qrisAmount) || 0

        if (cashAmount <= 0 && qrisAmount <= 0) {
          setError("Masukkan jumlah pembayaran")
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

        await onSubmit({
          debtId: form.debtId,
          cashAmount: form.cashAmount,
          qrisAmount: form.qrisAmount,
          cashAccountId: form.cashAccountId,
          qrisAccountId: form.qrisAccountId || undefined
        })
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  const activeBarbers = barbers.filter(b => b.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Tambah Hutang Gaji" : "Bayar Hutang Gaji"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Catat hutang gaji untuk barber" : "Lunasi hutang gaji barber"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "add" && (
            <>
              <div>
                <Label>Barber</Label>
                <Select value={form.barberId} onValueChange={(value) => setForm({ ...form, barberId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barber" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBarbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Jumlah Hutang</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Alasan</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Alasan hutang"
                />
              </div>
            </>
          )}

          {mode === "pay" && debt && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Barber</Label>
                    <p className="font-medium">{debt.barberName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sisa Hutang</Label>
                    <p className="font-medium text-red-600">{debt.amount}</p>
                  </div>
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
                      {cashAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
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
                      {cashAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

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
            {submitting ? "Memproses..." : mode === "add" ? "Tambah Hutang" : "Bayar Hutang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
