'use client'

import { SalaryAdjustment } from '../../types/types'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { ExpandableCard } from '@/components/ui/expandable-card'

interface AdjustmentCardProps {
  adjustment: SalaryAdjustment
  barberName?: string
}

export function AdjustmentCard({ adjustment, barberName }: AdjustmentCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `Rp ${numAmount.toLocaleString('id-ID')}`
  }

  const isBonus = adjustment.type === 'BONUS'

  const summaryContent = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isBonus ? (
              <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <h3 className="font-semibold text-gray-900 truncate">
              {isBonus ? 'Bonus' : 'Potongan'}
            </h3>
          </div>
          {barberName && (
            <p className="text-sm text-gray-500 ml-7 truncate">{barberName}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
          isBonus 
            ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100' 
            : 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100'
        }`}>
          {isBonus ? 'Bonus' : 'Potongan'}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-7">
        <span className="text-sm text-gray-500">Jumlah</span>
        <span className={`font-bold text-base ${isBonus ? 'text-green-600' : 'text-red-600'}`}>
          {isBonus ? '+' : '-'}{formatCurrency(adjustment.amount)}
        </span>
      </div>
    </>
  )

  const detailContent = (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-gray-600 text-sm shrink-0">Alasan:</span>
        <p className="text-gray-900 text-sm">{adjustment.reason}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(adjustment.createdAt)}</span>
      </div>
    </div>
  )

  return (
    <ExpandableCard summary={summaryContent}>
      {detailContent}
    </ExpandableCard>
  )
}
