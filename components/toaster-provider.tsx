"use client"

import { ToastProvider } from "@/hooks/use-toast"

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
