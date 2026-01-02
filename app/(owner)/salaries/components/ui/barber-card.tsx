'use client'

import { Barber } from '../../types/types'
import { User, DollarSign, Percent } from 'lucide-react'

interface BarberCardProps {
  barber: Barber
  onClick?: () => void
}

export function BarberCard({ barber, onClick }: BarberCardProps) {
  const compensationTypeText = barber.compensationType === 'COMMISSION_ONLY' 
    ? 'Komisi Saja' 
    : 'Gaji Pokok + Komisi'

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{barber.name}</h3>
            <p className="text-sm text-gray-500">{compensationTypeText}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          barber.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {barber.isActive ? 'Aktif' : 'Tidak Aktif'}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{barber.commissionRate}% Komisi</span>
        </div>
        {barber.baseSalary && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Rp {barber.baseSalary.toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
