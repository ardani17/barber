import Decimal from "decimal.js"

export const formatCurrency = (amount: number | string | Decimal): string => {
  const decimal = new Decimal(amount)
  return decimal.toDecimalPlaces(2).toNumber().toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

export const calculateTotal = (
  price: number | string | Decimal,
  quantity: number
): Decimal => {
  return new Decimal(price).mul(quantity)
}

export const calculateCommission = (
  price: number | string | Decimal,
  commissionRate: number | string | Decimal
): Decimal => {
  return new Decimal(price).mul(commissionRate)
}

export const calculateNetProfit = (
  grossProfit: number | string | Decimal,
  expenses: number | string | Decimal,
  commissions: number | string | Decimal
): Decimal => {
  return new Decimal(grossProfit)
    .minus(expenses)
    .minus(commissions)
}
