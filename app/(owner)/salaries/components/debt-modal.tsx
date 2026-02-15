'use client'

import { useState } from 'react'
import { Modal } from './ui/modal'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
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
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Hutang">
      <form onSubmit={handleSubmit} className="space-y-4">
        {barberName && (
          <div>
            <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
          </div>
        )}
        
        <Input
          label="Jumlah Hutang"
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
