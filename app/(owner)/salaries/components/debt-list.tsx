'use client'

import { SalaryDebt } from '../types/types'
import { DebtCard } from './ui/debt-card'

interface DebtListProps {
  debts: SalaryDebt[]
  barberName?: string
}

export function DebtList({ debts, barberName }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data hutang</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          barberName={barberName}
        />
      ))}
    </div>
  )
}
