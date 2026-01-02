"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import type { DateRangeType } from "@/types"

interface DateRangePickerProps {
  selectedRange: DateRangeType
  onRangeChange: (range: DateRangeType) => void
  customStartDate?: Date | undefined
  customEndDate?: Date | undefined
  onCustomStartDateChange?: (date: Date | undefined) => void
  onCustomEndDateChange?: (date: Date | undefined) => void
}

export function DateRangePicker({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange
}: DateRangePickerProps) {
  const showCustomPicker = selectedRange === "custom"

  const handleRangeChange = (value: string) => {
    onRangeChange(value as DateRangeType)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split("-").map(Number)
      onCustomStartDateChange?.(new Date(year, month - 1, day, 0, 0, 0))
    } else {
      onCustomStartDateChange?.(undefined)
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split("-").map(Number)
      onCustomEndDateChange?.(new Date(year, month - 1, day, 23, 59, 59))
    } else {
      onCustomEndDateChange?.(undefined)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <Button
          variant={selectedRange === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("today")}
          className={`text-xs sm:text-sm ${
            selectedRange === "today"
              ? "bg-yellow-500 text-black hover:bg-yellow-600"
              : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-800"
          }`}
        >
          Hari Ini
        </Button>
        <Button
          variant={selectedRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("week")}
          className={`text-xs sm:text-sm ${
            selectedRange === "week"
              ? "bg-yellow-500 text-black hover:bg-yellow-600"
              : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-800"
          }`}
        >
          7 Hari
        </Button>
        <Button
          variant={selectedRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("month")}
          className={`text-xs sm:text-sm ${
            selectedRange === "month"
              ? "bg-yellow-500 text-black hover:bg-yellow-600"
              : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-800"
          }`}
        >
          30 Hari
        </Button>
        <Button
          variant={selectedRange === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("custom")}
          className={`text-xs sm:text-sm ${
            selectedRange === "custom"
              ? "bg-yellow-500 text-black hover:bg-yellow-600"
              : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-800"
          }`}
        >
          Custom
        </Button>
      </div>

      {showCustomPicker && (
        <div className="flex flex-wrap items-center gap-2 bg-card border border-yellow-500 dark:border-gray-700 rounded-lg p-1 sm:p-2">
          <Calendar className="h-4 w-4 text-yellow-500" />
          <div className="flex items-center gap-2">
            <div>
              <Label className="text-xs">Mulai</Label>
              <Input
                type="date"
                value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                onChange={handleStartDateChange}
                className="border-0 text-xs sm:text-sm text-black dark:text-white focus:ring-0 bg-transparent h-8"
              />
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">-</span>
            <div>
              <Label className="text-xs">Akhir</Label>
              <Input
                type="date"
                value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                onChange={handleEndDateChange}
                className="border-0 text-xs sm:text-sm text-black dark:text-white focus:ring-0 bg-transparent h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
