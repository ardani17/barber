'use client'

import { useState } from 'react'
import { Modal } from './ui/modal'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ZodError } from 'zod'
import { logError } from '@/lib/logger'

interface PeriodModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PeriodFormData) => Promise<void>
  initialData?: PeriodFormData
  barberName?: string
}

export interface PeriodFormData {
  barberId: string
  periodStart: string
  periodEnd: string
  isActive: boolean
}

export function PeriodModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  barberName
}: PeriodModalProps) {
  const [formData, setFormData] = useState<PeriodFormData>(
    initialData || {
      barberId: '',
      periodStart: '',
      periodEnd: '',
      isActive: true
    }
  )

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai')
      return
    }
    
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      logError('PeriodModal', 'Gagal submit periode gaji', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menyimpan periode gaji')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Periode Gaji">
      <form onSubmit={handleSubmit} className="space-y-4">
        {barberName && (
          <div>
            <p className="text-sm text-gray-600">Barber: <strong>{barberName}</strong></p>
          </div>
        )}
        
        <Input
          label="Tanggal Mulai"
          type="date"
          value={formData.periodStart}
          onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
          required
        />
        
        <Input
          label="Tanggal Selesai"
          type="date"
          value={formData.periodEnd}
          onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
          required
        />
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Periode Aktif
          </label>
        </div>
        
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
