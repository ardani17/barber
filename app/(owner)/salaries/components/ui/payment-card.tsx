'use client'

import { SalaryPayment } from '../../types/types'
import { Calendar, DollarSign, CreditCard, Wallet } from 'lucide-react'
import { ExpandableCard } from '@/components/ui/expandable-card'

interface PaymentCardProps {
  payment: SalaryPayment
  barberName?: string
}

export function PaymentCard({ payment, barberName }: PaymentCardProps) {
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

  const isPositiveAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return numAmount > 0
  }

  const summaryContent = (
    <>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">Pembayaran Gaji</h3>
          {barberName && (
            <p className="text-sm text-gray-500 truncate">{barberName}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">{formatDate(payment.paymentDate)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-gray-500">Total</span>
        <span className="font-bold text-base sm:text-lg text-blue-600">
          {formatCurrency(payment.totalAmount)}
        </span>
      </div>
    </>
  )

  const detailContent = (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Periode:</span>
          <span className="text-gray-900">
            {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
          </span>
        </div>
        {isPositiveAmount(payment.baseSalaryAmount) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Gaji Pokok:</span>
            <span className="text-gray-900">{formatCurrency(payment.baseSalaryAmount)}</span>
          </div>
        )}
        {isPositiveAmount(payment.commissionAmount) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Komisi:</span>
            <span className="text-gray-900">{formatCurrency(payment.commissionAmount)}</span>
          </div>
        )}
        {isPositiveAmount(payment.bonusAmount) && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Bonus:</span>
            <span>+{formatCurrency(payment.bonusAmount)}</span>
          </div>
        )}
        {isPositiveAmount(payment.deductionAmount) && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Potongan:</span>
            <span>-{formatCurrency(payment.deductionAmount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500 mb-2">Metode Pembayaran</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Wallet className="w-4 h-4" />
            <span>Cash: {formatCurrency(payment.cashAmount)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span>QRIS: {formatCurrency(payment.qrisAmount)}</span>
          </div>
        </div>
      </div>

      {payment.notes && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-1">Catatan</p>
          <p className="text-sm text-gray-700">{payment.notes}</p>
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
