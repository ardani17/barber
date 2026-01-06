import { Suspense } from 'react'
import { getSalaryPeriods } from '@/actions/salary-payments'
import { getBarbers } from '@/actions/barbers'
import { getSalaryPayments, getSalaryDebts, getSalaryAdjustments, getCashAccounts } from '@/actions/salary-payments'
import SalariesClient from './salaries-client'
import type { Barber } from './types/types'

export const metadata = {
  title: 'Manajemen Gaji - BaberShop',
  description: 'Kelola pembayaran gaji berdasarkan periode'
}

export const dynamic = 'force-dynamic'

async function SalariesContent() {
  const [initialPeriods, initialBarbers, initialPayments, initialDebts, initialAdjustments, initialCashAccounts] = await Promise.all([
    getSalaryPeriods(),
    getBarbers(),
    getSalaryPayments(),
    getSalaryDebts(),
    getSalaryAdjustments(),
    getCashAccounts()
  ])

  const barbers = initialBarbers.map(barber => ({
    id: barber.id,
    name: barber.name,
    commissionRate: parseFloat(barber.commissionRate),
    baseSalary: barber.baseSalary ? parseFloat(barber.baseSalary) : null,
    compensationType: barber.compensationType,
    isActive: barber.isActive
  }))

  return (
    <SalariesClient
      initialPeriods={initialPeriods}
      initialBarbers={barbers}
      initialPayments={initialPayments}
      initialDebts={initialDebts}
      initialAdjustments={initialAdjustments}
      initialCashAccounts={initialCashAccounts}
    />
  )
}

function SalariesSkeleton() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="h-5 sm:h-10 w-40 sm:w-64 bg-muted rounded animate-pulse" />
          <div className="h-3 sm:h-5 w-24 sm:w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 sm:h-10 w-16 sm:w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-12">
        <div className="space-y-3 sm:space-y-4">
          <div className="h-32 sm:h-40 w-full bg-muted rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="h-16 sm:h-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-16 sm:h-24 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SalariesPage() {
  return (
    <Suspense fallback={<SalariesSkeleton />}>
      <SalariesContent />
    </Suspense>
  )
}
