'use client'

import { SalaryPeriod } from '../../types/types'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

interface PeriodCardProps {
  period: SalaryPeriod
  barberName?: string
}

export function PeriodCard({ period, barberName }: PeriodCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{period.name}</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${
            period.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {period.isActive ? 'Aktif' : 'Tidak Aktif'}
          </div>
        </div>
        <Calendar className="w-5 h-5 text-blue-600" />
      </div>

      {barberName && (
        <p className="text-sm text-gray-500 mb-2">{barberName}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Mulai:</span>
          <span className="text-gray-900 font-medium">
            {formatDate(period.startDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Selesai:</span>
          <span className="text-gray-900 font-medium">
            {formatDate(period.endDate)}
          </span>
        </div>
      </div>
    </div>
  )
}
