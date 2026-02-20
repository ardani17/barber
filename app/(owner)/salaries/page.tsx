'use client'

import { useState, useEffect } from 'react'
import { logError } from "@/lib/logger"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, DollarSign, Wallet, TrendingUp, ArrowRight, Calendar, ChevronRight, Edit, Trash2, Power, PowerOff } from 'lucide-react'
import { getSalaryPeriods, getSalaryPayments, getSalaryDebts, getSalaryAdjustments, paySalary, getCashAccounts, getPeriodSalaryDetail, createSalaryPeriod, updateSalaryPeriod, deleteSalaryPeriod, deactivateSalaryPeriod, activateSalaryPeriod } from '@/actions/salary-payments'
import { getBarbers } from '@/actions/barbers'
import type { SalaryPeriod, SalaryPayment, SalaryDebt, SalaryAdjustment, Barber } from './types/types'
import { ZodError } from 'zod'
import { PullToRefreshContainer } from '@/hooks/use-pull-to-refresh'

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

export default function SalariesPage() {
  const [periods, setPeriods] = useState<SalaryPeriod[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [payments, setPayments] = useState<SalaryPayment[]>([])
  const [debts, setDebts] = useState<SalaryDebt[]>([])
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null)
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
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([])
  const [selectedPaymentBarber, setSelectedPaymentBarber] = useState<{ id: string; name: string } | null>(null)
  const [periodSalaryDetail, setPeriodSalaryDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [periodsData, barbersData, paymentsData, debtsData, adjustmentsData, cashAccountsData] = await Promise.all([
        getSalaryPeriods(),
        getBarbers(),
        getSalaryPayments(),
        getSalaryDebts(),
        getSalaryAdjustments(),
        getCashAccounts()
      ])
      setPeriods(periodsData)
      setBarbers(barbersData.map(barber => ({
        id: barber.id,
        name: barber.name,
        commissionRate: parseFloat(barber.commissionRate),
        baseSalary: barber.baseSalary ? parseFloat(barber.baseSalary) : null,
        compensationType: barber.compensationType,
        isActive: barber.isActive
      })))
      setPayments(paymentsData)
      setDebts(debtsData)
      setAdjustments(adjustmentsData)
      setCashAccounts(cashAccountsData)
    } catch (error) {
      logError("Salaries", "Error loading data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      setEditingPeriodId(null)
      setFormData({ barberId: '', name: '', startDate: '', endDate: '' })
      loadData()
    } catch (error) {
      logError("Salaries", "Error saving period", error)
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => err.message).join('\n')
        alert(errorMessages)
      } else if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Gagal menyimpan periode gaji')
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
      setPeriodToDelete(null)
      loadData()
    } catch (error) {
      logError("Salaries", "Error deleting period", error)
      alert(error instanceof Error ? error.message : 'Gagal menghapus periode gaji')
    }
  }

  const cancelDeletePeriod = () => {
    setDeleteConfirmOpen(false)
    setPeriodToDelete(null)
  }

  const handleToggleActive = async (period: SalaryPeriod) => {
    try {
      if (period.isActive) {
        await deactivateSalaryPeriod(period.id)
      } else {
        await activateSalaryPeriod(period.id, period.barberId)
      }
      loadData()
    } catch (error) {
      logError("Salaries", "Error toggling active period", error)
      alert(error instanceof Error ? error.message : 'Gagal mengubah status periode gaji')
    }
  }

  const openCreateModal = () => {
    setEditMode(false)
    setEditingPeriodId(null)
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
      const kasbonOutstanding = debts
        .filter(d => d.barberId === barberId && !d.isPaid && d.type === 'KASBON')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0)
      const netPayable = Math.max(parseFloat(detail.totalShouldPay) - kasbonOutstanding, 0)
      setPaymentFormData(prev => ({
        ...prev,
        tunaiAmount: netPayable.toFixed(0)
      }))
      setPaymentModalOpen(true)
    } catch (error) {
      logError('Salaries', 'Gagal mengambil rincian gaji', error)
      alert(error instanceof Error ? error.message : 'Gagal mengambil rincian gaji')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleSubmitPayment = async () => {
    const tunaiAmount = parseFloat(paymentFormData.tunaiAmount || '0')
    const bankAmount = parseFloat(paymentFormData.bankAmount || '0')
    const qrisAmount = parseFloat(paymentFormData.qrisAmount || '0')
    const totalPayment = tunaiAmount + bankAmount + qrisAmount
    const bonusAmount = parseFloat(paymentFormData.bonusAmount || '0')
    const deductionAmount = parseFloat(paymentFormData.deductionAmount || '0')

    const kasbonOutstanding = debts
      .filter(d => d.barberId === paymentFormData.barberId && !d.isPaid && d.type === 'KASBON')
      .reduce((sum, d) => sum + parseFloat(d.amount), 0)

    const baseShouldPay = periodSalaryDetail ? parseFloat(periodSalaryDetail.totalShouldPay) : 0
    const grossPayable = baseShouldPay + bonusAmount - deductionAmount
    const netPayable = Math.max(grossPayable - kasbonOutstanding, 0)

    if (Math.abs(totalPayment - netPayable) > 0.0001) {
      alert(`Total pembayaran harus sama dengan gaji bersih setelah potong kasbon: ${formatCurrency(netPayable)}`)
      return
    }

    if (tunaiAmount > 0 && !paymentFormData.tunaiAccountId) {
      alert('Pilih akun tunai untuk pembayaran tunai')
      return
    }

    if (bankAmount > 0 && !paymentFormData.bankAccountId) {
      alert('Pilih akun bank untuk pembayaran bank')
      return
    }

    if (qrisAmount > 0 && !paymentFormData.qrisAccountId) {
      alert('Pilih akun QRIS untuk pembayaran QRIS')
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
      setSelectedPaymentBarber(null)
      loadData()
    } catch (error) {
      logError("Salaries", "Error paying salary", error)
      alert(error instanceof Error ? error.message : 'Gagal membayar gaji')
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

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <div className="text-center py-8 sm:py-12">
          <p className="text-xs sm:text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <PullToRefreshContainer onRefresh={loadData} className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
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
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {period.isActive && (
                        <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-xs font-medium bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100">
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
                        <p className="text-xs sm:text-xs text-blue-600 dark:text-blue-400 font-medium">Total Dibayar</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(totals.totalPaid)}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs sm:text-xs text-green-600 dark:text-green-400 font-medium">Total Bonus</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(totals.totalBonus)}
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs sm:text-xs text-red-600 dark:text-red-400 font-medium">Total Hutang</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-red-900 dark:text-red-100">
                        {formatCurrency(totals.totalDebt)}
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                        <p className="text-xs sm:text-xs text-purple-600 dark:text-purple-400 font-medium">Total Potongan</p>
                      </div>
                      <p className="text-xs sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(totals.totalDeduction)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summaries.map((summary) => (
                    <div
                      key={summary.barberId}
                      className="p-3 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {summary.barberName}
                            </h3>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Dibayar</p>
                              <p className="font-medium text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                                {formatCurrency(summary.totalPaid)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Bonus</p>
                              <p className="font-medium text-green-600 dark:text-green-400 text-xs sm:text-sm">
                                {formatCurrency(summary.totalBonus)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Hutang</p>
                              <p className="font-medium text-red-600 dark:text-red-400 text-xs sm:text-sm">
                                {formatCurrency(summary.totalDebt)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Potongan</p>
                              <p className="font-medium text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                                {formatCurrency(summary.totalDeduction)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:gap-3 w-full sm:w-auto ml-0 sm:ml-6">
                          <div>
                            <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Gaji Bersih</p>
                            <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(summary.netSalary)}
                            </p>
                          </div>
                          <Button
                            onClick={() => openPaymentModal(summary.barberId, summary.barberName, period)}
                            size="sm"
                            className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm"
                          >
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Bayar Gaji</span>
                            <span className="sm:hidden">Bayar</span>
                          </Button>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">{editMode ? 'Edit Periode Gaji' : 'Buat Periode Gaji Baru'}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editMode ? 'Edit periode gaji untuk mengelola pembayaran capster' : 'Buat periode gaji untuk mengelola pembayaran capster'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-xs sm:text-xs">Pilih Capster *</Label>
              <select
                value={formData.barberId}
                onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                disabled={editMode}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <option value="">Pilih capster...</option>
                {barbers.filter(b => b.isActive).map(barber => {
                  const hasBaseSalary = barber.baseSalary && barber.baseSalary > 0
                  return (
                    <option key={barber.id} value={barber.id}>
                      {barber.name} {hasBaseSalary ? '(Gaji Pokok)' : '(Komisi)'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <Label htmlFor="periodName" className="text-xs sm:text-xs">Nama Periode *</Label>
              <Input
                id="periodName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Gaji Januari 2025"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                aria-describedby="periodName-hint"
              />
            </div>

            <div>
              <Label htmlFor="periodStartDate" className="text-xs sm:text-xs">Tanggal Mulai *</Label>
              <Input
                id="periodStartDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            <div>
              <Label htmlFor="periodEndDate" className="text-xs sm:text-xs">Tanggal Akhir *</Label>
              <Input
                id="periodEndDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            {formData.barberId && (
              <div className="text-xs sm:text-xs text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-md">
                {(() => {
                  const barber = barbers.find(b => b.id === formData.barberId)
                  if (!barber) return null
                  
                  const hasBaseSalary = barber.baseSalary && barber.baseSalary > 0
                  
                  if (hasBaseSalary) {
                    return (
                      <div>
                        <strong>ℹ️ Catatan:</strong> Capster ini menggunakan gaji pokok, 
                        jadi periode harus tepat 1 bulan (±5 hari). 
                        Contoh: 15 Januari - 14 Februari.
                      </div>
                    )
                  } else {
                    return (
                      <div>
                        <strong>ℹ️ Catatan:</strong> Capster ini hanya menggunakan komisi, 
                        jadi periode bisa bebas/custom.
                      </div>
                    )
                  }
                })()}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 sm:pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              Batal
            </Button>
            <Button onClick={handleSubmitPeriod} disabled={submitting} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              {submitting ? (editMode ? 'Menyimpan...' : 'Membuat...') : (editMode ? 'Simpan Perubahan' : 'Buat Periode')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Bayar Gaji - {selectedPaymentBarber?.name}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {formatDate(paymentFormData.periodStart)} - {formatDate(paymentFormData.periodEnd)}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-gray-500">Memuat rincian gaji...</p>
            </div>
          ) : periodSalaryDetail ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {(() => {
                const kasbonOutstanding = debts
                  .filter(d => d.barberId === paymentFormData.barberId && !d.isPaid && d.type === 'KASBON')
                  .reduce((sum, d) => sum + parseFloat(d.amount), 0)
                const bonusAmount = parseFloat(paymentFormData.bonusAmount || '0')
                const deductionAmount = parseFloat(paymentFormData.deductionAmount || '0')
                const grossPayable = parseFloat(periodSalaryDetail.totalShouldPay) + bonusAmount - deductionAmount
                const netPayable = Math.max(grossPayable - kasbonOutstanding, 0)

                return (
                  <>
                    {kasbonOutstanding > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Kasbon Outstanding:</span>
                        <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
                          -{formatCurrency(kasbonOutstanding)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 sm:pt-3 mt-2 sm:mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-base font-semibold text-gray-900 dark:text-white">Total bersih:</span>
                        <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(netPayable)}
                        </span>
                      </div>
                    </div>
                  </>
                )
              })()}
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gaji Pokok:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(periodSalaryDetail.baseSalary)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Komisi ({periodSalaryDetail.transactionCount} transaksi):</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(periodSalaryDetail.commissionAmount)}
                </span>
              </div>
              {periodSalaryDetail.bonusAmount !== '0' && (
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bonus:</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(periodSalaryDetail.bonusAmount)}
                  </span>
                </div>
              )}
              {periodSalaryDetail.deductionAmount !== '0' && (
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Potongan:</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(periodSalaryDetail.deductionAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 sm:pt-3 mt-2 sm:mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-base font-semibold text-gray-900 dark:text-white">Total sebelum kasbon:</span>
                  <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(periodSalaryDetail.totalShouldPay)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-gray-500">Gagal memuat rincian gaji</p>
            </div>
          )}

          <div className="space-y-2 sm:space-y-4">
            <div>
              <Label className="text-xs sm:text-xs">Jumlah Tunai</Label>
              <Input
                type="number"
                value={paymentFormData.tunaiAmount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, tunaiAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            {paymentFormData.tunaiAmount && parseFloat(paymentFormData.tunaiAmount) > 0 && (
              <div>
                <Label className="text-xs sm:text-xs">Akun Tunai *</Label>
                <select
                  value={paymentFormData.tunaiAccountId}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, tunaiAccountId: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Pilih akun tunai...</option>
                  {cashAccounts.filter(a => a.type === 'TUNAI').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs sm:text-xs">Jumlah Bank</Label>
              <Input
                type="number"
                value={paymentFormData.bankAmount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, bankAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            {paymentFormData.bankAmount && parseFloat(paymentFormData.bankAmount) > 0 && (
              <div>
                <Label className="text-xs sm:text-xs">Akun Bank *</Label>
                <select
                  value={paymentFormData.bankAccountId}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, bankAccountId: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Pilih akun bank...</option>
                  {cashAccounts.filter(a => a.type === 'BANK').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs sm:text-xs">Jumlah QRIS</Label>
              <Input
                type="number"
                value={paymentFormData.qrisAmount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, qrisAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            {paymentFormData.qrisAmount && parseFloat(paymentFormData.qrisAmount) > 0 && (
              <div>
                <Label className="text-xs sm:text-xs">Akun QRIS *</Label>
                <select
                  value={paymentFormData.qrisAccountId}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, qrisAccountId: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Pilih akun QRIS...</option>
                  {cashAccounts.filter(a => a.type === 'QRIS').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs sm:text-xs">Bonus</Label>
              <Input
                type="number"
                value={paymentFormData.bonusAmount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, bonusAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            <div>
              <Label className="text-xs sm:text-xs">Potongan</Label>
              <Input
                type="number"
                value={paymentFormData.deductionAmount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, deductionAmount: e.target.value })}
                placeholder="0"
                min="0"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            <div>
              <Label className="text-xs sm:text-xs">Catatan</Label>
              <Input
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                placeholder="Catatan pembayaran (opsional)"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              />
            </div>

            {(() => {
              const tunaiAmount = parseFloat(paymentFormData.tunaiAmount) || 0
              const bankAmount = parseFloat(paymentFormData.bankAmount) || 0
              const qrisAmount = parseFloat(paymentFormData.qrisAmount) || 0
              const bonusAmount = parseFloat(paymentFormData.bonusAmount) || 0
              const deductionAmount = parseFloat(paymentFormData.deductionAmount) || 0
              const totalPayment = tunaiAmount + bankAmount + qrisAmount

              if (tunaiAmount > 0 || bankAmount > 0 || qrisAmount > 0 || bonusAmount > 0 || deductionAmount > 0) {
                return (
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Tunai:</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(tunaiAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Bank:</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(bankAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">QRIS:</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(qrisAmount)}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Total Pembayaran:</span>
                          <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(totalPayment)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(bonusAmount > 0 || deductionAmount > 0) && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Bonus:</span>
                          <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                            +{formatCurrency(bonusAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Potongan:</span>
                          <span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(deductionAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            })()}
          </div>

          <DialogFooter className="pt-3 sm:pt-4">
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)} disabled={paying} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              Batal
            </Button>
            <Button onClick={handleSubmitPayment} disabled={paying} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              {paying ? 'Memproses...' : 'Bayar Gaji'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Hapus Periode Gaji</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus periode gaji ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={cancelDeletePeriod} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeletePeriod} className="h-8 sm:h-auto px-2 sm:px-4 text-xs sm:text-sm">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PullToRefreshContainer>
  )
}
