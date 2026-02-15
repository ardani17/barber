'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ZodError } from 'zod'
import { logError } from '@/lib/logger'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PaymentFormData) => Promise<void>
  initialData?: PaymentFormData
  barberName?: string
}

export interface PaymentFormData {
  barberId: string
  periodStart: string
  periodEnd: string
  baseSalaryAmount: number
  commissionAmount: number
  bonusAmount: number
  deductionAmount: number
  totalAmount: number
  cashAmount: string
  qrisAmount: string
  notes?: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  barberName
}: PaymentModalProps) {
  const [formData, setFormData] = useState<PaymentFormData>(
    initialData || {
      barberId: '',
      periodStart: '',
      periodEnd: '',
      baseSalaryAmount: 0,
      commissionAmount: 0,
      bonusAmount: 0,
      deductionAmount: 0,
      totalAmount: 0,
      cashAmount: '',
      qrisAmount: '',
      notes: ''
    }
  )

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      logError('PaymentModal', 'Gagal submit pembayaran gaji', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menyimpan pembayaran gaji')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran Gaji</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {barberName && (
            <div>
              <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Tanggal Mulai Periode</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Tanggal Selesai Periode</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSalaryAmount">Gaji Pokok</Label>
              <Input
                id="baseSalaryAmount"
                type="number"
                step="0.01"
                value={formData.baseSalaryAmount || ''}
                onChange={(e) => setFormData({ ...formData, baseSalaryAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commissionAmount">Komisi</Label>
              <Input
                id="commissionAmount"
                type="number"
                step="0.01"
                value={formData.commissionAmount || ''}
                onChange={(e) => setFormData({ ...formData, commissionAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonusAmount">Bonus</Label>
              <Input
                id="bonusAmount"
                type="number"
                step="0.01"
                value={formData.bonusAmount || ''}
                onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductionAmount">Potongan</Label>
              <Input
                id="deductionAmount"
                type="number"
                step="0.01"
                value={formData.deductionAmount || ''}
                onChange={(e) => setFormData({ ...formData, deductionAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Gaji (Manual)</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              value={formData.totalAmount || ''}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Jumlah Cash</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                value={formData.cashAmount || ''}
                onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qrisAmount">Jumlah QRIS</Label>
              <Input
                id="qrisAmount"
                type="number"
                step="0.01"
                value={formData.qrisAmount || ''}
                onChange={(e) => setFormData({ ...formData, qrisAmount: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
