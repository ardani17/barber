import { Suspense } from 'react'
import { getBarbers } from '@/actions/barbers'
import BarbersClient from './barbers-client'

export const metadata = {
  title: 'Pengelola Capster - BaberShop',
  description: 'Kelola data capster, komisi, dan gaji pokok'
}

export const dynamic = 'force-dynamic'

async function BarbersContent() {
  const initialBarbers = await getBarbers()

  return <BarbersClient initialBarbers={initialBarbers} />
}

function BarbersSkeleton() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="h-6 sm:h-10 w-32 sm:w-48 bg-muted rounded animate-pulse" />
        <div className="h-6 sm:h-10 w-20 sm:w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="h-8 sm:h-10 w-full bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-3 sm:p-6 h-40 sm:h-48" />
        ))}
      </div>
    </div>
  )
}

export default function BarbersPage() {
  return (
    <Suspense fallback={<BarbersSkeleton />}>
      <BarbersContent />
    </Suspense>
  )
}
