'use client'

import { useState } from 'react'
import { Modal } from './ui/modal'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ZodError } from 'zod'

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
      if (!(error instanceof ZodError)) {
        console.error('Error submitting payment:', error)
      }
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
    <Modal isOpen={isOpen} onClose={onClose} title="Pembayaran Gaji">
      <form onSubmit={handleSubmit} className="space-y-4">
        {barberName && (
          <div>
            <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
          </div>
        )}
        
        <Input
          label="Tanggal Mulai Periode"
          type="date"
          value={formData.periodStart}
          onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
          required
        />
        
        <Input
          label="Tanggal Selesai Periode"
          type="date"
          value={formData.periodEnd}
          onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
          required
        />
        
        <Input
          label="Gaji Pokok"
          type="number"
          step="0.01"
          value={formData.baseSalaryAmount || ''}
          onChange={(e) => setFormData({ ...formData, baseSalaryAmount: parseFloat(e.target.value) || 0 })}
        />
        
        <Input
          label="Komisi"
          type="number"
          step="0.01"
          value={formData.commissionAmount || ''}
          onChange={(e) => setFormData({ ...formData, commissionAmount: parseFloat(e.target.value) || 0 })}
        />
        
        <Input
          label="Bonus"
          type="number"
          step="0.01"
          value={formData.bonusAmount || ''}
          onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) || 0 })}
        />
        
        <Input
          label="Potongan"
          type="number"
          step="0.01"
          value={formData.deductionAmount || ''}
          onChange={(e) => setFormData({ ...formData, deductionAmount: parseFloat(e.target.value) || 0 })}
        />
        
        <Input
          label="Total Gaji (Manual)"
          type="number"
          step="0.01"
          value={formData.totalAmount || ''}
          onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
          required
        />
        
        <Input
          label="Jumlah Cash"
          type="number"
          step="0.01"
          value={formData.cashAmount || ''}
          onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
          required
        />
        
        <Input
          label="Jumlah QRIS"
          type="number"
          step="0.01"
          value={formData.qrisAmount || ''}
          onChange={(e) => setFormData({ ...formData, qrisAmount: e.target.value })}
          required
        />
        
        <Textarea
          label="Catatan"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
        
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
