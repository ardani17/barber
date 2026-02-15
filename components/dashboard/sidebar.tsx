"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Wallet,
  Settings,
  Users,
  DollarSign,
  CalendarCheck,
  X,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: Receipt },
  { href: "/inventory", label: "Inventaris", icon: Package },
  { href: "/salaries", label: "Manajemen Gaji", icon: DollarSign },
  { href: "/barbers", label: "Pengelola Capster", icon: Users },
  { href: "/attendance", label: "Absensi", icon: CalendarCheck },
  { href: "/cashflow", label: "Cashflow", icon: Wallet },
  { href: "/settings", label: "Pengaturan", icon: Settings }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <aside
        role="navigation"
        aria-label="Menu navigasi utama"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-yellow-500 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-yellow-500 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold">BARBERBRO</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-muted/50 rounded"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Menu dashboard" className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-yellow-500 text-black font-semibold"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
