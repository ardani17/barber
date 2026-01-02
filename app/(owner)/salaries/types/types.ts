export interface Barber {
  id: string
  name: string
  isActive: boolean
  commissionRate: number
  baseSalary: number | null
  compensationType: 'BASE_ONLY' | 'COMMISSION_ONLY' | 'BOTH'
  password?: string
  createdAt?: Date
  salaryPayments?: SalaryPayment[]
  salaryDebts?: SalaryDebt[]
  salaryAdjustments?: SalaryAdjustment[]
  salaryPeriods?: SalaryPeriod[]
}

export interface SalaryPayment {
  id: string
  barberId: string
  barberName: string
  periodStart: Date
  periodEnd: Date
  baseSalaryAmount: string
  commissionAmount: string
  bonusAmount: string
  deductionAmount: string
  totalAmount: string
  cashAmount: string
  qrisAmount: string
  cashAccountName: string | null
  qrisAccountName: string | null
  paymentDate: Date
  notes: string | null
}

export interface SalaryDebt {
  id: string
  barberId: string
  barberName: string
  amount: string
  reason: string
  isPaid: boolean
  paidDate: Date | null
  createdAt: Date
}

export interface SalaryAdjustment {
  id: string
  barberId: string
  barberName: string
  periodStart: Date
  periodEnd: Date
  type: 'BONUS' | 'DEDUCTION'
  amount: string
  reason: string
  createdAt: Date
}

export interface SalaryPeriod {
  id: string
  barberId: string
  barberName: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BarberSalaryReport {
  barber: Barber
  totalRevenue: number
  totalCommission: number
  totalBaseSalary: number
  totalAdjustments: number
  totalDeductions: number
  totalSalary: number
}

export interface Attendance {
  id: string
  barberId: string
  barber?: Barber
  date: Date
  checkInTime: Date | null
  checkOutTime: Date | null
  notes: string | null
  createdAt: Date
}

export type CompensationType = 'BASE_ONLY' | 'COMMISSION_ONLY' | 'BOTH'
export type AdjustmentType = 'BONUS' | 'DEDUCTION'
