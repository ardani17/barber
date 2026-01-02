'use client'

import { SalaryAdjustment } from '../types/types'
import { AdjustmentCard } from './ui/adjustment-card'

interface AdjustmentListProps {
  adjustments: SalaryAdjustment[]
  barberName?: string
}

export function AdjustmentList({ adjustments, barberName }: AdjustmentListProps) {
  if (adjustments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data penyesuaian</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {adjustments.map((adjustment) => (
        <AdjustmentCard
          key={adjustment.id}
          adjustment={adjustment}
          barberName={barberName}
        />
      ))}
    </div>
  )
}
