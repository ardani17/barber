"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface Barber {
  id: string
  name: string
}

interface Cashier {
  id: string
  username: string
}

interface TransactionsFilterProps {
  range: string
  barbers: Barber[]
  cashiers: Cashier[]
  selectedBarber: string
  selectedCashier: string
  selectedPaymentMethod: string
  searchQuery: string
  startDate?: string
  endDate?: string
}

export default function TransactionsFilter({
  range,
  barbers,
  cashiers,
  selectedBarber,
  selectedCashier,
  selectedPaymentMethod,
  searchQuery,
  startDate,
  endDate
}: TransactionsFilterProps) {
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, value)
    params.delete("page")
    window.history.pushState({}, "", `?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    params.delete("page")
    window.history.pushState({}, "", `?${params.toString()}`)
  }

  return (
    <div className="mb-4 sm:mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm">Cari Transaksi</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="No. transaksi atau pelanggan..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 sm:flex-none">
            <Label htmlFor="barber" className="text-sm">Barber</Label>
            <Select
              value={selectedBarber}
              onValueChange={(value) => handleFilterChange("barber", value)}
            >
              <SelectTrigger id="barber" className="mt-1 text-sm w-full sm:w-40">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 sm:flex-none">
            <Label htmlFor="cashier" className="text-sm">Kasir</Label>
            <Select
              value={selectedCashier}
              onValueChange={(value) => handleFilterChange("cashier", value)}
            >
              <SelectTrigger id="cashier" className="mt-1 text-sm w-full sm:w-40">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {cashiers.map((cashier) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 sm:flex-none">
            <Label htmlFor="paymentMethod" className="text-sm">Metode</Label>
            <Select
              value={selectedPaymentMethod}
              onValueChange={(value) => handleFilterChange("paymentMethod", value)}
            >
              <SelectTrigger id="paymentMethod" className="mt-1 text-sm w-full sm:w-40">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="TUNAI">Tunai</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
