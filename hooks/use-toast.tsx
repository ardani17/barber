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

interface ToastContextValue {
  toast: (props: Omit<ToastState, "open">) => void
  state: ToastState | null
  dismiss: () => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToastState | null>(null)

  const toast = React.useCallback((props: Omit<ToastState, "open">) => {
    setState({ ...props, open: true })
  }, [])

  const dismiss = React.useCallback(() => {
    setState(null)
  }, [])

  const value = React.useMemo(() => ({ toast, state, dismiss }), [toast, state, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {state && (
        <Toast
          open={state.open}
          onOpenChange={(open) => {
            if (!open) dismiss()
          }}
          title={state.title}
          description={state.description}
          variant={state.variant}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
