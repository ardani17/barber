"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DateRangePicker } from "@/components/owner/date-range-picker"
import type { DateRangeType } from "@/types"

export function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedRange = (searchParams.get("range") as DateRangeType) || "month"
  const customStartDate = searchParams.get("start")
  const customEndDate = searchParams.get("end")

  const handleRangeChange = (range: DateRangeType) => {
    const params = new URLSearchParams(searchParams)
    params.set("range", range)
    params.delete("start")
    params.delete("end")
    router.push(`?${params.toString()}`)
  }

  const handleCustomDateChange = (start?: Date, end?: Date) => {
    const params = new URLSearchParams(searchParams)
    params.set("range", "custom")
    
    if (start) {
      const year = start.getFullYear()
      const month = String(start.getMonth() + 1).padStart(2, '0')
      const day = String(start.getDate()).padStart(2, '0')
      params.set("start", `${year}-${month}-${day}`)
    } else {
      params.delete("start")
    }
    
    if (end) {
      const year = end.getFullYear()
      const month = String(end.getMonth() + 1).padStart(2, '0')
      const day = String(end.getDate()).padStart(2, '0')
      params.set("end", `${year}-${month}-${day}`)
    } else {
      params.delete("end")
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <DateRangePicker
      selectedRange={selectedRange}
      onRangeChange={handleRangeChange}
      customStartDate={customStartDate ? new Date(customStartDate) : undefined}
      customEndDate={customEndDate ? new Date(customEndDate) : undefined}
      onCustomStartDateChange={(date) => handleCustomDateChange(date, customEndDate ? new Date(customEndDate) : undefined)}
      onCustomEndDateChange={(date) => handleCustomDateChange(customStartDate ? new Date(customStartDate) : undefined, date)}
    />
  )
}
