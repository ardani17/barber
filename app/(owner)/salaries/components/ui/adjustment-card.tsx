'use client'

import { SalaryAdjustment } from '../../types/types'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBonus ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
          <h3 className="font-semibold text-gray-900">
            {isBonus ? 'Bonus' : 'Potongan'}
          </h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isBonus 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isBonus ? 'Bonus' : 'Potongan'}
        </div>
      </div>

      {barberName && (
        <p className="text-sm text-gray-500 ml-7 mb-2">{barberName}</p>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Jumlah:</span>
          <span className={`font-bold text-lg ${
            isBonus ? 'text-green-600' : 'text-red-600'
          }`}>
            {isBonus ? '+' : '-'}{formatCurrency(adjustment.amount)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-600">Alasan:</span>
          <p className="text-gray-900 text-sm">{adjustment.reason}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(adjustment.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
