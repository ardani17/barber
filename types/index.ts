import Decimal from "decimal.js"

export type UserRole = "OWNER" | "CASHIER"
export type CompensationType = "BASE_ONLY" | "COMMISSION_ONLY" | "BOTH"
export type PaymentMethod = "CASH" | "CARD" | "E_WALLET"
export type TransactionItemType = "SERVICE" | "PRODUCT"
export type ExpenseCategory = "RENT" | "UTILITIES" | "SUPPLIES" | "OTHER"
export type DateRangeType = "today" | "week" | "month" | "quarter" | "year" | "custom"

export interface User {
  id: string
  username: string
  role: UserRole
}

export interface Barber {
  id: string
  name: string
  isActive: boolean
  commissionRate: string
  baseSalary: string | null
  compensationType: CompensationType
}

export interface Service {
  id: string
  name: string
  price: Decimal
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  buyPrice: Decimal
  sellPrice: Decimal
  stock: number
  isActive: boolean
}

export interface Transaction {
  id: string
  date: Date
  totalAmount: Decimal
  totalCommission: Decimal
  paymentMethod: PaymentMethod
  cashierId: string
  barberId: string
  items: TransactionItem[]
  cashier?: User
  barber?: Barber
}

export interface TransactionItem {
  id: string
  type: TransactionItemType
  quantity: number
  unitPrice: Decimal
  subtotal: Decimal
  serviceId: string | null
  productId: string | null
  service?: Service
  product?: Product
}

export interface Expense {
  id: string
  title: string
  amount: Decimal
  date: Date
  category: ExpenseCategory
}

export interface CartItem {
  id: string
  type: "SERVICE" | "PRODUCT"
  name: string
  price: Decimal
  quantity: number
  stock?: number
}

export interface CashAccount {
  id: string
  name: string
  balance: Decimal
  type: "CASH" | "QRIS"
}

export interface SalaryData {
  barberId: string
  barberName: string
  periodStart: Date
  periodEnd: Date
  baseSalaryAmount: string
  commissionAmount: string
  totalAmount: string
}

export interface PaymentData {
  barberName: string
  periodStart: Date
  periodEnd: Date
  baseSalaryAmount: string
  commissionAmount: string
  totalAmount: string
}

export interface SalaryDebt {
  id: string
  barberId: string
  barberName: string
  amount: string
  reason: string
  createdAt: Date
  paidAt: Date | null
}
