'use client'

import { SalaryDebt } from '../../types/types'
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

interface DebtCardProps {
  debt: SalaryDebt
  barberName?: string
}

export function DebtCard({ debt, barberName }: DebtCardProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {debt.isPaid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            )}
            <h3 className="font-semibold text-gray-900">
              {debt.isPaid ? 'Hutang Lunas' : 'Hutang Belum Lunas'}
            </h3>
          </div>
          {barberName && (
            <p className="text-sm text-gray-500 ml-7">{barberName}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          debt.isPaid 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {debt.isPaid ? 'Lunas' : 'Belum Lunas'}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Jumlah:</span>
          <span className="font-bold text-lg text-red-600">
            {formatCurrency(debt.amount)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-600">Alasan:</span>
          <p className="text-gray-900 text-sm">{debt.reason}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(debt.createdAt)}</span>
        </div>
        {debt.paidDate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Dibayar: {formatDate(debt.paidDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
