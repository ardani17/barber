'use client'

import { SalaryPayment } from '../types/types'
import { PaymentCard } from './ui/payment-card'

interface PaymentListProps {
  payments: SalaryPayment[]
  barberName?: string
}

export function PaymentList({ payments, barberName }: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada data pembayaran gaji</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          barberName={barberName}
        />
      ))}
    </div>
  )
}
