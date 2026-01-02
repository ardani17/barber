'use client'

import { SalaryPeriod } from '../types/types'
import { PeriodCard } from './ui/period-card'

interface PeriodListProps {
  periods: SalaryPeriod[]
  barberName?: string
}

export function PeriodList({ periods, barberName }: PeriodListProps) {
  if (periods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data periode gaji</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {periods.map((period) => (
        <PeriodCard
          key={period.id}
          period={period}
          barberName={barberName}
        />
      ))}
    </div>
  )
}
