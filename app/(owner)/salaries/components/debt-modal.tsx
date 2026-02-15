'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ZodError } from 'zod'
import { logError } from '@/lib/logger'

interface DebtModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DebtFormData) => Promise<void>
  initialData?: DebtFormData
  barberName?: string
}

export interface DebtFormData {
  barberId: string
  amount: string
  reason: string
}

export function DebtModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  barberName
}: DebtModalProps) {
  const [formData, setFormData] = useState<DebtFormData>(
    initialData || {
      barberId: '',
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
      logError('DebtModal', 'Gagal submit hutang', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menyimpan hutang')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Hutang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {barberName && (
            <div>
              <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="debtAmount">Jumlah Hutang</Label>
            <Input
              id="debtAmount"
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="debtReason">Alasan</Label>
            <Textarea
              id="debtReason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
              placeholder="Alasan hutang"
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
