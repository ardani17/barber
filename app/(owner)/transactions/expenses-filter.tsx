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
import { Search } from "lucide-react"

interface ExpensesFilterProps {
  range: string
  selectedCategory: string
  searchQuery: string
  startDate?: string
  endDate?: string
}

export default function ExpensesFilter({
  range,
  selectedCategory,
  searchQuery,
  startDate,
  endDate
}: ExpensesFilterProps) {
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, value)
    window.history.pushState({}, "", `?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set("expenseSearch", value)
    } else {
      params.delete("expenseSearch")
    }
    window.history.pushState({}, "", `?${params.toString()}`)
  }

  return (
    <div className="mb-4 sm:mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="expenseSearch" className="text-sm">Cari Pengeluaran</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="expenseSearch"
              placeholder="Deskripsi pengeluaran..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 sm:flex-none">
          <Label htmlFor="category" className="text-sm">Kategori</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger id="category" className="mt-1 text-sm w-full sm:w-48">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="RENT">Sewa</SelectItem>
              <SelectItem value="UTILITIES">Utilitas</SelectItem>
              <SelectItem value="SUPPLIES">Perlengkapan</SelectItem>
              <SelectItem value="OTHER">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
