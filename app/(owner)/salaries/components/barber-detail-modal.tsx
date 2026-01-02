'use client'

import { useState } from 'react'
import { Barber, SalaryPayment, SalaryDebt, SalaryAdjustment, SalaryPeriod } from '../types/types'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { PaymentList } from './payment-list'
import { DebtList } from './debt-list'
import { AdjustmentList } from './adjustment-list'
import { PeriodList } from './period-list'
import { PaymentModal, PaymentFormData } from './payment-modal'
import { DebtModal, DebtFormData } from './debt-modal'
import { AdjustmentModal, AdjustmentFormData } from './adjustment-modal'
import { PeriodModal, PeriodFormData } from './period-modal'
import { paySalary, addSalaryDebt, addSalaryAdjustment, createSalaryPeriod } from '@/actions/salary-payments'
import { ZodError } from 'zod'

interface BarberDetailModalProps {
  isOpen: boolean
  onClose: () => void
  barber: Barber
  payments: SalaryPayment[]
  debts: SalaryDebt[]
  adjustments: SalaryAdjustment[]
  periods: SalaryPeriod[]
  onDataRefresh: () => void
}

export function BarberDetailModal({
  isOpen,
  onClose,
  barber,
  payments,
  debts,
  adjustments,
  periods,
  onDataRefresh
}: BarberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'debts' | 'adjustments' | 'periods'>('payments')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false)
  const [periodModalOpen, setPeriodModalOpen] = useState(false)

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    try {
      await paySalary({
        barberId: data.barberId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        tunaiAmount: data.cashAmount || '0',
        bankAmount: '0',
        qrisAmount: data.qrisAmount || '0',
        tunaiAccountId: parseFloat(data.cashAmount) > 0 ? 'default-cash' : undefined,
        qrisAccountId: parseFloat(data.qrisAmount) > 0 ? 'default-qris' : undefined,
        notes: data.notes
      })
      onDataRefresh()
    } catch (error) {
      console.error('Error paying salary:', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal membayar gaji')
      }
    }
  }

  const handleDebtSubmit = async (data: DebtFormData) => {
    try {
      await addSalaryDebt(data)
      onDataRefresh()
    } catch (error) {
      console.error('Error adding debt:', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menambahkan hutang')
      }
    }
  }

  const handleAdjustmentSubmit = async (data: AdjustmentFormData) => {
    try {
      await addSalaryAdjustment({
        barberId: data.barberId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        type: data.type,
        amount: data.amount,
        reason: data.reason
      })
      onDataRefresh()
    } catch (error) {
      console.error('Error adding adjustment:', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menambahkan penyesuaian')
      }
    }
  }

  const handlePeriodSubmit = async (data: PeriodFormData) => {
    try {
      await createSalaryPeriod({
        barberId: data.barberId,
        name: `Periode ${data.periodStart} - ${data.periodEnd}`,
        startDate: new Date(data.periodStart),
        endDate: new Date(data.periodEnd)
      })
      onDataRefresh()
    } catch (error) {
      console.error('Error creating period:', error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal membuat periode gaji')
      }
    }
  }

  const tabs = [
    { id: 'payments' as const, label: 'Pembayaran', count: payments.length },
    { id: 'debts' as const, label: 'Hutang', count: debts.length },
    { id: 'adjustments' as const, label: 'Penyesuaian', count: adjustments.length },
    { id: 'periods' as const, label: 'Periode', count: periods.length }
  ]

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Detail: ${barber.name}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status: {barber.isActive ? 'Aktif' : 'Tidak Aktif'}</p>
              <p className="text-sm text-gray-600">
                Komisi: {barber.commissionRate}% | Gaji Pokok: {barber.baseSalary ? `Rp ${barber.baseSalary.toLocaleString('id-ID')}` : '-'}
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="flex justify-end gap-2">
            {activeTab === 'payments' && (
              <Button size="sm" onClick={() => setPaymentModalOpen(true)}>
                + Tambah Pembayaran
              </Button>
            )}
            {activeTab === 'debts' && (
              <Button size="sm" onClick={() => setDebtModalOpen(true)}>
                + Tambah Hutang
              </Button>
            )}
            {activeTab === 'adjustments' && (
              <Button size="sm" onClick={() => setAdjustmentModalOpen(true)}>
                + Tambah Penyesuaian
              </Button>
            )}
            {activeTab === 'periods' && (
              <Button size="sm" onClick={() => setPeriodModalOpen(true)}>
                + Tambah Periode
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {activeTab === 'payments' && (
              <PaymentList payments={payments} barberName={barber.name} />
            )}
            {activeTab === 'debts' && (
              <DebtList debts={debts} barberName={barber.name} />
            )}
            {activeTab === 'adjustments' && (
              <AdjustmentList adjustments={adjustments} barberName={barber.name} />
            )}
            {activeTab === 'periods' && (
              <PeriodList periods={periods} barberName={barber.name} />
            )}
          </div>
        </div>
      </Modal>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        barberName={barber.name}
        initialData={{
          barberId: barber.id,
          periodStart: '',
          periodEnd: '',
          baseSalaryAmount: 0,
          commissionAmount: 0,
          bonusAmount: 0,
          deductionAmount: 0,
          totalAmount: 0,
          cashAmount: '',
          qrisAmount: '',
          notes: ''
        }}
      />

      <DebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        onSubmit={handleDebtSubmit}
        barberName={barber.name}
        initialData={{
          barberId: barber.id,
          amount: '',
          reason: ''
        }}
      />

      <AdjustmentModal
        isOpen={adjustmentModalOpen}
        onClose={() => setAdjustmentModalOpen(false)}
        onSubmit={handleAdjustmentSubmit}
        barberName={barber.name}
        initialData={{
          barberId: barber.id,
          periodStart: '',
          periodEnd: '',
          type: 'BONUS',
          amount: '',
          reason: ''
        }}
      />

      <PeriodModal
        isOpen={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        onSubmit={handlePeriodSubmit}
        barberName={barber.name}
        initialData={{
          barberId: barber.id,
          periodStart: '',
          periodEnd: '',
          isActive: true
        }}
      />
    </>
  )
}
