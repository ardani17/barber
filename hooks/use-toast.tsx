"use client"

import * as React from "react"
import { Toast } from "@/components/ui/toast"

type ToastVariant = "default" | "destructive"

interface ToastState {
  open: boolean
  title?: string
  description?: string
  variant?: ToastVariant
}

let toastState: ToastState | null = null
let toastSetters: React.Dispatch<React.SetStateAction<ToastState | null>> | null = null

export function useToast() {
  const [state, setState] = React.useState<ToastState | null>(null)

  React.useEffect(() => {
    toastSetters = setState
    return () => {
      if (toastSetters === setState) {
        toastSetters = null
      }
    }
  }, [])

  const toast = React.useCallback((props: Omit<ToastState, "open">) => {
    toastState = { ...props, open: true }
    toastSetters?.(toastState)
  }, [])

  return { toast, state }
}

export function Toaster() {
  const { state } = useToast()

  if (!state) return null

  return (
    <Toast
      open={state.open}
      onOpenChange={(open) => {
        if (!open) {
          toastSetters?.(null)
          toastState = null
        }
      }}
      title={state.title}
      description={state.description}
      variant={state.variant}
    />
  )
}
