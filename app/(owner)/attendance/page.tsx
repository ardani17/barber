import { Suspense } from 'react'
import { getAttendances } from '@/actions/attendances'
import { getBarbers } from '@/actions/barbers'
import AttendanceClient from './attendance-client'

export const metadata = {
  title: 'Absensi - BaberShop',
  description: 'Monitor kehadiran capster harian'
}

export const dynamic = 'force-dynamic'

async function AttendanceContent({
  searchParams
}: {
  searchParams: Promise<{ date?: string; barber?: string; status?: string }>
}) {
  const params = await searchParams
  const initialDate = params.date || new Date().toISOString().split('T')[0]
  const initialBarber = params.barber || 'all'
  const initialStatus = params.status || 'all'

  const [initialAttendances, initialBarbers] = await Promise.all([
    getAttendances(initialBarber !== 'all' ? initialBarber : undefined, initialDate),
    getBarbers()
  ])

  return (
    <AttendanceClient
      initialAttendances={initialAttendances}
      initialBarbers={initialBarbers}
      initialDate={initialDate}
      initialBarber={initialBarber}
      initialStatus={initialStatus}
    />
  )
}

function AttendanceSkeleton() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <div className="h-6 sm:h-10 w-32 sm:w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 sm:h-6 w-48 sm:w-64 bg-muted rounded animate-pulse mt-1 sm:mt-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-2 sm:p-4">
            <div className="h-8 sm:h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-muted rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 sm:h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg h-64 sm:h-96" />
    </div>
  )
}

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ date?: string; barber?: string; status?: string }>
}) {
  return (
    <Suspense fallback={<AttendanceSkeleton />}>
      <AttendanceContent searchParams={searchParams} />
    </Suspense>
  )
}
