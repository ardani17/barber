'use client'

import { Barber } from '../types/types'
import { BarberCard } from './ui/barber-card'

interface BarberListProps {
  barbers: Barber[]
  onBarberClick?: (barber: Barber) => void
}

export function BarberList({ barbers, onBarberClick }: BarberListProps) {
  if (barbers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data barber</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {barbers.map((barber) => (
        <BarberCard
          key={barber.id}
          barber={barber}
          onClick={() => onBarberClick?.(barber)}
        />
      ))}
    </div>
  )
}
