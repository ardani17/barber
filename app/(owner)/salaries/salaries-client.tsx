'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Toast } from '@/components/ui/toast'
import { Plus, DollarSign, Wallet, TrendingUp, Calendar, Edit, Trash2, Power, PowerOff, XCircle, CheckCircle } from 'lucide-react'
import { getSalaryPayments, getSalaryDebts, getSalaryAdjustments, paySalary, getCashAccounts, getPeriodSalaryDetail, createSalaryPeriod, updateSalaryPeriod, deleteSalaryPeriod, deactivateSalaryPeriod, activateSalaryPeriod } from '@/actions/salary-payments'
import type { SalaryPeriod, SalaryPayment, SalaryDebt, SalaryAdjustment, Barber } from './types/types'
import { ZodError } from 'zod'

interface PeriodFormData {
  barberId: string
  name: string
  startDate: string
  endDate: string
}

interface PaymentFormData {
  barberId: string
  periodStart: Date
  periodEnd: Date
  tunaiAmount: string
  bankAmount: string
  qrisAmount: string
  tunaiAccountId: string
  bankAccountId: string
  qrisAccountId: string
  bonusAmount: string
  deductionAmount: string
  notes: string
}

interface CashAccount {
  id: string
  name: string
  type: string
  balance: string
}

interface BarberSalarySummary {
  barberId: string
  barberName: string
  totalPaid: string
  totalDebt: string
  totalBonus: string
  totalDeduction: string
  netSalary: string
}

interface SalariesClientProps {
  initialPeriods: SalaryPeriod[]
  initialBarbers: Barber[]
  initialPayments: SalaryPayment[]
  initialDebts: SalaryDebt[]
  initialAdjustments: SalaryAdjustment[]
  initialCashAccounts: CashAccount[]
}

export default function SalariesClient({
  initialPeriods,
  initialBarbers,
  initialPayments,
  initialDebts,
  initialAdjustments,
  initialCashAccounts
}: SalariesClientProps) {
  const [periods, setPeriods] = useState<SalaryPeriod[]>(initialPeriods)
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers)
  const [payments, setPayments] = useState<SalaryPayment[]>(initialPayments)
  const [debts, setDebts] = useState<SalaryDebt[]>(initialDebts)
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>(initialAdjustments)
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>(initialCashAccounts)
  const [modalOpen, setModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingPeriodId, setEditingPeriodId] = useState<string | undefined>(undefined)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<string | undefined>(undefined)
  const [formData, setFormData] = useState<PeriodFormData>({
    barberId: '',
    name: '',
    startDate: '',
    endDate: ''
  })
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    barberId: '',
    periodStart: new Date(),
    periodEnd: new Date(),
    tunaiAmount: '',
    bankAmount: '',
    qrisAmount: '',
    tunaiAccountId: '',
    bankAccountId: '',
    qrisAccountId: '',
    bonusAmount: '',
    deductionAmount: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [selectedPaymentBarber, setSelectedPaymentBarber] = useState<{ id: string; name: string } | undefined>(undefined)
  const [periodSalaryDetail, setPeriodSalaryDetail] = useState<any>(undefined)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; title?: string; description?: string; variant?: 'default' | 'destructive' }>({
    open: false
  })

  const loadData = async () => {
    try {
      const [periodsData, paymentsData, debtsData, adjustmentsData, cashAccountsData] = await Promise.all([
        fetchSalaryPeriods(),
        getSalaryPayments(),
        getSalaryDebts(),
        getSalaryAdjustments(),
        getCashAccounts()
      ])
      setPeriods(periodsData)
      setPayments(paymentsData)
      setDebts(debtsData)
      setAdjustments(adjustmentsData)
      setCashAccounts(cashAccountsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmitPeriod = async () => {
    try {
      setSubmitting(true)
      if (editMode && editingPeriodId) {
        await updateSalaryPeriod({
          id: editingPeriodId,
          name: formData.name,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        })
      } else {
        await createSalaryPeriod({
          barberId: formData.barberId,
          name: formData.name,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        })
      }
      setModalOpen(false)
      setEditMode(false)
      setEditingPeriodId(undefined)
      setFormData({ barberId: '', name: '', startDate: '', endDate: '' })
      loadData()
      setToast({
        open: true,
        title: 'Berhasil',
        description: editMode ? 'Periode gaji berhasil diperbarui' : 'Periode gaji berhasil dibuat',
        variant: 'default'
      })
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error('Error saving period:', error)
      }
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join(', ')
        setToast({
          open: true,
          title: 'Validasi Gagal',
          description: errorMessages,
          variant: 'destructive'
        })
      } else if (error instanceof Error) {
        setToast({
          open: true,
          title: 'Gagal',
          description: error.message,
          variant: 'destructive'
        })
      } else {
        setToast({
          open: true,
          title: 'Gagal',
          description: 'Gagal menyimpan periode gaji',
          variant: 'destructive'
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPeriod = (period: SalaryPeriod) => {
    setEditMode(true)
    setEditingPeriodId(period.id)
    setFormData({
      barberId: period.barberId,
      name: period.name,
      startDate: new Date(period.startDate).toISOString().split('T')[0],
      endDate: new Date(period.endDate).toISOString().split('T')[0]
    })
    setModalOpen(true)
  }

  const handleDeletePeriod = (periodId: string) => {
    setPeriodToDelete(periodId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeletePeriod = async () => {
    if (!periodToDelete) return

    try {
      await deleteSalaryPeriod(periodToDelete)
      setDeleteConfirmOpen(false)
      setPeriodToDelete(undefined)
      loadData()
      setToast({
        open: true,
        title: 'Berhasil',
        description: 'Periode gaji berhasil dihapus',
        variant: 'default'
      })
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error('Error deleting period:', error)
      }
      setToast({
        open: true,
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal menghapus periode gaji',
        variant: 'destructive'
      })
    }
  }

  const cancelDeletePeriod = () => {
    setDeleteConfirmOpen(false)
    setPeriodToDelete(undefined)
  }

  const handleToggleActive = async (period: SalaryPeriod) => {
    try {
      if (period.isActive) {
        await deactivateSalaryPeriod(period.id)
      } else {
        await activateSalaryPeriod(period.id, period.barberId)
      }
      loadData()
      setToast({
        open: true,
        title: 'Berhasil',
        description: period.isActive ? 'Periode gaji berhasil dinonaktifkan' : 'Periode gaji berhasil diaktifkan',
        variant: 'default'
      })
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error('Error toggling active period:', error)
      }
      setToast({
        open: true,
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal mengubah status periode gaji',
        variant: 'destructive'
      })
    }
  }

  const openCreateModal = () => {
    setEditMode(false)
    setEditingPeriodId(undefined)
    setFormData({ barberId: '', name: '', startDate: '', endDate: '' })
    setModalOpen(true)
  }

  const openPaymentModal = async (barberId: string, barberName: string, period: SalaryPeriod) => {
    setSelectedPaymentBarber({ id: barberId, name: barberName })
    setPaymentFormData({
      barberId,
      periodStart: new Date(period.startDate),
      periodEnd: new Date(period.endDate),
      tunaiAmount: '',
      bankAmount: '',
      qrisAmount: '',
      tunaiAccountId: '',
      bankAccountId: '',
      qrisAccountId: '',
      bonusAmount: '',
      deductionAmount: '',
      notes: ''
    })
    setLoadingDetail(true)
    try {
      const detail = await getPeriodSalaryDetail(barberId, new Date(period.startDate), new Date(period.endDate))
      setPeriodSalaryDetail(detail)
      setPaymentModalOpen(true)
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error('Error loading salary detail:', error)
      }
      setToast({
        open: true,
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal mengambil rincian gaji',
        variant: 'destructive'
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleSubmitPayment = async () => {
    const tunaiAmount = parseFloat(paymentFormData.tunaiAmount || '0')
    const bankAmount = parseFloat(paymentFormData.bankAmount || '0')
    const qrisAmount = parseFloat(paymentFormData.qrisAmount || '0')
    const totalPayment = tunaiAmount + bankAmount + qrisAmount

    if (totalPayment <= 0) {
      setToast({
        open: true,
        title: 'Validasi Gagal',
        description: 'Total pembayaran harus lebih dari 0',
        variant: 'destructive'
      })
      return
    }

    if (tunaiAmount > 0 && !paymentFormData.tunaiAccountId) {
      setToast({
        open: true,
        title: 'Validasi Gagal',
        description: 'Pilih akun tunai untuk pembayaran tunai',
        variant: 'destructive'
      })
      return
    }

    if (bankAmount > 0 && !paymentFormData.bankAccountId) {
      setToast({
        open: true,
        title: 'Validasi Gagal',
        description: 'Pilih akun bank untuk pembayaran bank',
        variant: 'destructive'
      })
      return
    }

    if (qrisAmount > 0 && !paymentFormData.qrisAccountId) {
      setToast({
        open: true,
        title: 'Validasi Gagal',
        description: 'Pilih akun QRIS untuk pembayaran QRIS',
        variant: 'destructive'
      })
      return
    }

    try {
      setPaying(true)
      await paySalary({
        barberId: paymentFormData.barberId,
        periodStart: paymentFormData.periodStart,
        periodEnd: paymentFormData.periodEnd,
        tunaiAmount: paymentFormData.tunaiAmount || '0',
        bankAmount: paymentFormData.bankAmount || '0',
        qrisAmount: paymentFormData.qrisAmount || '0',
        tunaiAccountId: paymentFormData.tunaiAmount ? paymentFormData.tunaiAccountId : undefined,
        bankAccountId: paymentFormData.bankAmount ? paymentFormData.bankAccountId : undefined,
        qrisAccountId: paymentFormData.qrisAmount ? paymentFormData.qrisAccountId : undefined,
        bonusAmount: paymentFormData.bonusAmount || '0',
        deductionAmount: paymentFormData.deductionAmount || '0',
        notes: paymentFormData.notes
      })
      setPaymentModalOpen(false)
      setSelectedPaymentBarber(undefined)
      loadData()
      setToast({
        open: true,
        title: 'Berhasil',
        description: 'Pembayaran gaji berhasil dilakukan',
        variant: 'default'
      })
    } catch (error) {
      if (!(error instanceof ZodError)) {
        console.error('Error paying salary:', error)
      }
      setToast({
        open: true,
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal membayar gaji',
        variant: 'destructive'
      })
    } finally {
      setPaying(false)
    }
  }

  const calculateBarberSalarySummary = (period: SalaryPeriod, barberId: string): BarberSalarySummary => {
    const periodPayments = payments.filter(p => 
      p.barberId === barberId &&
      p.periodStart >= period.startDate &&
      p.periodEnd <= period.endDate
    )
    
    const periodDebts = debts.filter(d => d.barberId === barberId)
    
    const periodAdjustments = adjustments.filter(a =>
      a.barberId === barberId &&
      a.periodStart >= period.startDate &&
      a.periodEnd <= period.endDate
    )

    const totalPaid = periodPayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0)
    const totalDebt = periodDebts.filter(d => !d.isPaid).reduce((sum, d) => sum + parseFloat(d.amount), 0)
    const totalBonus = periodAdjustments.filter(a => a.type === 'BONUS').reduce((sum, a) => sum + parseFloat(a.amount), 0)
    const totalDeduction = periodAdjustments.filter(a => a.type === 'DEDUCTION').reduce((sum, a) => sum + parseFloat(a.amount), 0)
    const netSalary = totalPaid + totalBonus - totalDeduction - totalDebt

    return {
      barberId,
      barberName: barbers.find(b => b.id === barberId)?.name || '',
      totalPaid: totalPaid.toFixed(0),
      totalDebt: totalDebt.toFixed(0),
      totalBonus: totalBonus.toFixed(0),
      totalDeduction: totalDeduction.toFixed(0),
      netSalary: netSalary.toFixed(0)
    }
  }

  const getPeriodBarberSummaries = (period: SalaryPeriod): BarberSalarySummary[] => {
    const periodBarber = barbers.find(b => b.id === period.barberId)
    if (!periodBarber) return []
    
    return [calculateBarberSalarySummary(period, periodBarber.id)]
  }

  const calculatePeriodTotal = (summaries: BarberSalarySummary[]) => {
    return summaries.reduce((acc, summary) => {
      return {
        totalPaid: acc.totalPaid + parseFloat(summary.totalPaid),
        totalDebt: acc.totalDebt + parseFloat(summary.totalDebt),
        totalBonus: acc.totalBonus + parseFloat(summary.totalBonus),
        totalDeduction: acc.totalDeduction + parseFloat(summary.totalDeduction),
        netSalary: acc.netSalary + parseFloat(summary.netSalary)
      }
    }, { totalPaid: 0, totalDebt: 0, totalBonus: 0, totalDeduction: 0, netSalary: 0 })
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Manajemen Gaji</h1>
          <p className="text-xs sm:text-sm text-gray-600">Kelola pembayaran gaji berdasarkan periode</p>
        </div>
        <Button onClick={openCreateModal} className="h-8 sm:h-10 px-2 sm:px-4">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Buat Periode Baru</span>
          <span className="sm:hidden">Buat</span>
        </Button>
      </div>

      <div className="space-y-6">
        {periods.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-12 text-center">
            <Calendar className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Periode Gaji</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
              Buat periode gaji baru untuk mulai mengelola pembayaran
            </p>
            <Button onClick={openCreateModal} className="h-8 sm:h-10 px-2 sm:px-4">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Buat Periode Pertama</span>
              <span className="sm:hidden">Buat</span>
            </Button>
          </div>
        ) : (
          periods.map((period) => {
            const summaries = getPeriodBarberSummaries(period)
            const totals = calculatePeriodTotal(summaries)

            return (
              <div key={period.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
                        {period.name}
                      </h2>
                      <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {period.isActive && (
                        <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Aktif
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button
                          onClick={() => handleToggleActive(period)}
                          className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={period.isActive ? "Nonaktifkan periode" : "Aktifkan periode"}
                        >
                          {period.isActive ? (
                            <PowerOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <Power className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditPeriod(period)}
                          className="p-1.5 sm:p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit periode"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="p-1.5 sm:p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Hapus periode"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">Total Dibayar</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(totals.totalPaid)}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">Total Bonus</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(totals.totalBonus)}
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium">Total Hutang</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-red-900 dark:text-red-100">
                        {formatCurrency(totals.totalDebt)}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                        <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">Total Potongan</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(totals.totalDeduction)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summaries.map((summary) => (
                    <div key={summary.barberId} className="p-3 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{summary.barberName}</h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            Net Gaji: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.netSalary)}</span>
                          </p>
                        </div>
                        <Button
                          onClick={() => openPaymentModal(summary.barberId, summary.barberName, period)}
                          className="h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs"
                        >
                          Bayar Gaji
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Dibayar</p>
                          <p className="text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(summary.totalPaid)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Bonus</p>
                          <p className="text-[10px] sm:text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(summary.totalBonus)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Hutang</p>
                          <p className="text-[10px] sm:text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(summary.totalDebt)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Potongan</p>
                          <p className="text-[10px] sm:text-sm font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(summary.totalDeduction)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editMode ? 'Edit Periode Gaji' : 'Buat Periode Gaji Baru'}</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-sm">
              {editMode ? 'Edit periode gaji yang ada' : 'Buat periode gaji baru untuk pembayaran'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-[10px] sm:text-sm">Capster *</Label>
              <select
                value={formData.barberId}
                onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-md border border-input bg-background text-[10px] sm:text-sm"
                disabled={editMode}
              >
                <option value="">Pilih capster</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] sm:text-sm">Nama Periode *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Januari 2025"
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              />
            </div>

            <div>
              <Label className="text-[10px] sm:text-sm">Tanggal Mulai *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              />
            </div>

            <div>
              <Label className="text-[10px] sm:text-sm">Tanggal Selesai *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              Batal
            </Button>
            <Button onClick={handleSubmitPeriod} disabled={submitting} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              {submitting ? 'Menyimpan...' : editMode ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Hapus Periode Gaji</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-sm">
              Apakah Anda yakin ingin menghapus periode gaji ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-4">
            <Button variant="outline" onClick={cancelDeletePeriod} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeletePeriod} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Bayar Gaji - {selectedPaymentBarber?.name}</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-sm">
              Pembayaran gaji untuk periode {periodSalaryDetail?.startDate && periodSalaryDetail?.endDate ? 
                `${formatDate(new Date(periodSalaryDetail.startDate))} - ${formatDate(new Date(periodSalaryDetail.endDate))}` : 
                'terpilih'}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="text-center py-8">
              <p className="text-xs sm:text-sm text-gray-500">Memuat rincian gaji...</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {periodSalaryDetail && (
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">Rincian Gaji</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total Pendapatan</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(periodSalaryDetail.totalIncome || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Komisi</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(periodSalaryDetail.commission || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Gaji Pokok</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(periodSalaryDetail.baseSalary || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Net Gaji</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(periodSalaryDetail.netSalary || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-[10px] sm:text-sm">Pembayaran Tunai</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={paymentFormData.tunaiAmount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, tunaiAmount: e.target.value })}
                    className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  />
                  <select
                    value={paymentFormData.tunaiAccountId}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, tunaiAccountId: e.target.value })}
                    className="h-8 sm:h-10 px-2 sm:px-3 rounded-md border border-input bg-background text-[10px] sm:text-sm w-32 sm:w-40"
                  >
                    <option value="">Pilih akun</option>
                    {cashAccounts.filter(a => a.type === 'TUNAI').map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] sm:text-sm">Pembayaran Bank</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={paymentFormData.bankAmount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, bankAmount: e.target.value })}
                    className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  />
                  <select
                    value={paymentFormData.bankAccountId}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, bankAccountId: e.target.value })}
                    className="h-8 sm:h-10 px-2 sm:px-3 rounded-md border border-input bg-background text-[10px] sm:text-sm w-32 sm:w-40"
                  >
                    <option value="">Pilih akun</option>
                    {cashAccounts.filter(a => a.type === 'BANK').map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] sm:text-sm">Pembayaran QRIS</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={paymentFormData.qrisAmount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, qrisAmount: e.target.value })}
                    className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  />
                  <select
                    value={paymentFormData.qrisAccountId}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, qrisAccountId: e.target.value })}
                    className="h-8 sm:h-10 px-2 sm:px-3 rounded-md border border-input bg-background text-[10px] sm:text-sm w-32 sm:w-40"
                  >
                    <option value="">Pilih akun</option>
                    {cashAccounts.filter(a => a.type === 'QRIS').map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[10px] sm:text-sm">Bonus (Opsional)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={paymentFormData.bonusAmount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, bonusAmount: e.target.value })}
                  className="h-8 sm:h-10 text-[10px] sm:text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-[10px] sm:text-sm">Potongan (Opsional)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={paymentFormData.deductionAmount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, deductionAmount: e.target.value })}
                  className="h-8 sm:h-10 text-[10px] sm:text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-[10px] sm:text-sm">Catatan (Opsional)</Label>
                <Input
                  placeholder="Catatan pembayaran"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  className="h-8 sm:h-10 text-[10px] sm:text-sm mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)} disabled={paying} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              Batal
            </Button>
            <Button onClick={handleSubmitPayment} disabled={paying} className="h-8 sm:h-10 px-2 sm:px-4 text-[10px] sm:text-sm">
              {paying ? 'Memproses...' : 'Bayar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
    </div>
  )
}

async function fetchSalaryPeriods() {
  const { getSalaryPeriods } = await import('@/actions/salary-payments')
  return getSalaryPeriods()
}
