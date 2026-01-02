"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
  duration = 5000,
}: ToastProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        setIsOpen(false)
        onOpenChange?.(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onOpenChange])

  if (!isOpen) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full">
      <div
        className={cn(
          "relative flex w-full max-w-md items-center justify-between space-x-4 rounded-lg border p-4 shadow-lg",
          variant === "destructive"
            ? "border-red-500 bg-red-50 text-red-900"
            : "border-gray-200 bg-white text-gray-900"
        )}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <p className="text-sm font-semibold">{title}</p>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsOpen(false)
            onOpenChange?.(false)
          }}
          className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}
