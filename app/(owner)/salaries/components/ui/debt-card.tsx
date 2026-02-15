'use client'

import { SalaryDebt } from '../../types/types'
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import { ExpandableCard } from '@/components/ui/expandable-card'

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

  const summaryContent = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {debt.isPaid ? (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            )}
            <h3 className="font-semibold text-gray-900 truncate">
              {debt.isPaid ? 'Hutang Lunas' : 'Hutang Belum Lunas'}
            </h3>
          </div>
          {barberName && (
            <p className="text-sm text-gray-500 ml-7 truncate">{barberName}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
          debt.isPaid 
            ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100' 
            : 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100'
        }`}>
          {debt.isPaid ? 'Lunas' : 'Belum Lunas'}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-7">
        <span className="text-sm text-gray-500">Jumlah</span>
        <span className="font-bold text-base text-red-600">
          {formatCurrency(debt.amount)}
        </span>
      </div>
    </>
  )

  const detailContent = (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-gray-600 text-sm shrink-0">Alasan:</span>
        <p className="text-gray-900 text-sm">{debt.reason}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>Dibuat: {formatDate(debt.createdAt)}</span>
      </div>
      {debt.paidDate && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Dibayar: {formatDate(debt.paidDate)}</span>
        </div>
      )}
    </div>
  )

  return (
    <ExpandableCard summary={summaryContent}>
      {detailContent}
    </ExpandableCard>
  )
}
