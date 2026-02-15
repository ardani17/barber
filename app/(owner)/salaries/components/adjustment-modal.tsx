'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ZodError } from 'zod'
import { logError } from '@/lib/logger'

interface AdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AdjustmentFormData) => Promise<void>
  initialData?: AdjustmentFormData
  barberName?: string
}

export interface AdjustmentFormData {
  barberId: string
  periodStart: string
  periodEnd: string
  type: 'BONUS' | 'DEDUCTION'
  amount: string
  reason: string
}

export function AdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  barberName
}: AdjustmentModalProps) {
  const [formData, setFormData] = useState<AdjustmentFormData>(
    initialData || {
      barberId: '',
      periodStart: '',
      periodEnd: '',
      type: 'BONUS',
      amount: '',
      reason: ''
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
      logError('AdjustmentModal', 'Gagal submit penyesuaian', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menyimpan penyesuaian')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Penyesuaian</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {barberName && (
            <div>
              <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjPeriodStart">Tanggal Mulai Periode</Label>
              <Input
                id="adjPeriodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjPeriodEnd">Tanggal Selesai Periode</Label>
              <Input
                id="adjPeriodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjType">Tipe</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'BONUS' | 'DEDUCTION' })}
            >
              <SelectTrigger id="adjType" className="w-full">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BONUS">Bonus</SelectItem>
                <SelectItem value="DEDUCTION">Potongan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjAmount">Jumlah</Label>
            <Input
              id="adjAmount"
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjReason">Alasan</Label>
            <Textarea
              id="adjReason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
              placeholder="Alasan penyesuaian"
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
