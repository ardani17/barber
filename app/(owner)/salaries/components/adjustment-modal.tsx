'use client'

import { useState } from 'react'
import { Modal } from './ui/modal'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ZodError } from 'zod'

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
      if (!(error instanceof ZodError)) {
        console.error('Error submitting adjustment:', error)
      }
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
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Penyesuaian">
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

        <Select
          label="Tipe"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'BONUS' | 'DEDUCTION' })}
          options={[
            { value: 'BONUS', label: 'Bonus' },
            { value: 'DEDUCTION', label: 'Potongan' }
          ]}
          required
        />

        <Input
          label="Jumlah"
          type="number"
          step="0.01"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <Textarea
          label="Alasan"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={3}
          required
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
