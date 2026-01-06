'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAttendances } from '@/actions/attendances'
import { Calendar, Filter, Download, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react'

interface Attendance {
  id: string
  barberId: string
  date: string
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'LIBUR' | 'PULANG'
  checkIn: string | null
  checkOut: string | null
  notes: string | null
  barber: {
    id: string
    name: string
  }
}

interface Barber {
  id: string
  name: string
  isActive: boolean
}

interface AttendanceClientProps {
  initialAttendances: Attendance[]
  initialBarbers: Barber[]
  initialDate: string
  initialBarber: string
  initialStatus: string
}

export default function AttendanceClient({
  initialAttendances,
  initialBarbers,
  initialDate,
  initialBarber,
  initialStatus
}: AttendanceClientProps) {
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances)
  const [barbers] = useState<Barber[]>(initialBarbers)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedBarber, setSelectedBarber] = useState(initialBarber)
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadAttendances = async () => {
    try {
      setLoading(true)
      const attendanceData = await getAttendances(
        selectedBarber !== 'all' ? selectedBarber : undefined,
        selectedDate
      )
      setAttendances(attendanceData)
      
      const params = new URLSearchParams(searchParams)
      if (selectedDate) params.set('date', selectedDate)
      if (selectedBarber) params.set('barber', selectedBarber)
      if (selectedStatus) params.set('status', selectedStatus)
      router.push(`/attendance?${params.toString()}`)
    } catch (error) {
      console.error('Error loading attendances:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HADIR':
        return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case 'PULANG':
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
      case 'IZIN':
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
      case 'SAKIT':
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
      case 'LIBUR':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
      default:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'PULANG':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'IZIN':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'SAKIT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'LIBUR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredAttendances = attendances.filter(att => {
    if (selectedStatus !== 'all' && att.status !== selectedStatus) return false
    return true
  })

  const activeBarbers = barbers.filter(b => b.isActive)

  const calculateStats = () => {
    const stats = {
      hadir: attendances.filter(a => a.status === 'HADIR').length,
      pulang: attendances.filter(a => a.status === 'PULANG').length,
      izin: attendances.filter(a => a.status === 'IZIN').length,
      sakit: attendances.filter(a => a.status === 'SAKIT').length,
      libur: attendances.filter(a => a.status === 'LIBUR').length
    }
    return stats
  }

  const stats = calculateStats()

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Absensi Capster</h1>
        <p className="text-xs sm:text-base text-gray-600">Monitor kehadiran capster harian</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.hadir}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Hadir</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pulang}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Pulang</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.izin}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Izin</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.sakit}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Sakit</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.libur}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Libur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Tanggal
            </label>
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Capster
            </label>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Semua capster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Capster</SelectItem>
                {activeBarbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id} className="text-xs sm:text-sm">
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="HADIR">Hadir</SelectItem>
                <SelectItem value="PULANG">Pulang</SelectItem>
                <SelectItem value="IZIN">Izin</SelectItem>
                <SelectItem value="SAKIT">Sakit</SelectItem>
                <SelectItem value="LIBUR">Libur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadAttendances} disabled={loading} className="w-full text-xs sm:text-sm h-9 sm:h-10">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
              <span className="sm:hidden">Filter</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-4 sm:p-8 text-center text-gray-500 text-[10px] sm:text-sm">Memuat data...</div>
        ) : filteredAttendances.length === 0 ? (
          <div className="p-4 sm:p-8 text-center text-gray-500 text-[10px] sm:text-sm">
            Tidak ada data absensi untuk tanggal yang dipilih
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-6 py-1.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Capster
                  </th>
                  <th className="px-2 sm:px-6 py-1.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Tanggal
                  </th>
                  <th className="px-2 sm:px-6 py-1.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Jam Masuk
                  </th>
                  <th className="px-2 sm:px-6 py-1.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Jam Pulang
                  </th>
                  <th className="px-2 sm:px-6 py-1.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-2 sm:px-6 py-1.5 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[80px] sm:max-w-none">
                        {attendance.barber.name}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-1.5 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(attendance.date).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-1.5 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm text-gray-900 dark:text-white">
                        {attendance.checkIn || '-'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-1.5 sm:py-4 whitespace-nowrap">
                      <div className="text-[10px] sm:text-sm text-gray-900 dark:text-white">
                        {attendance.checkOut || '-'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-1.5 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        <span className="mr-0.5 sm:mr-1">{getStatusIcon(attendance.status)}</span>
                        {attendance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
