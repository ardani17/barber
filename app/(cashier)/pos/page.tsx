"use client"

import { useState, useEffect } from "react"
import { logError } from "@/lib/logger"
import { useCartStore } from "@/stores/cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Scissors, Package, Plus, Minus, Trash2, User, Check, History, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/decimal"
import { getDailySummary } from "@/actions/transactions"



export default function POSPage() {
  const [activeTab, setActiveTab] = useState<"services" | "products">("services")
  const [viewMode, setViewMode] = useState<"pos" | "history">("pos")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [dailySummary, setDailySummary] = useState<any>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"TUNAI" | "QRIS">("TUNAI")
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, selectedBarber, addItem, removeItem, updateQuantity, setBarber, getTotal, clearCart, removeItemsByTypeAndIds } = useCartStore()
  const [showBarberSelector, setShowBarberSelector] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAttendance, setShowAttendance] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null)
  const [barberPassword, setBarberPassword] = useState("")
  const [attendanceBarber, setAttendanceBarber] = useState<any>(null)

  const loadData = async () => {
    try {
      const [barbersRes, servicesRes, productsRes] = await Promise.all([
        fetch("/api/barbers"),
        fetch("/api/services"),
        fetch("/api/products")
      ])

      if (barbersRes.ok && servicesRes.ok && productsRes.ok) {
        const [barbersData, servicesData, productsData] = await Promise.all([
          barbersRes.json(),
          servicesRes.json(),
          productsRes.json()
        ])

        const activeBarbers = barbersData.filter((barber: any) => barber.isActive)
        const activeServices = servicesData.filter((service: any) => service.isActive)
        const activeProducts = productsData.filter((product: any) => product.isActive)

        setBarbers(activeBarbers)
        setServices(activeServices)
        setProducts(activeProducts)

        if (selectedBarber && !activeBarbers.find((b: any) => b.id === selectedBarber.id)) {
          setBarber(null)
        }

        const disabledServiceIds = servicesData
          .filter((service: any) => !service.isActive)
          .map((s: any) => s.id)

        const disabledProductIds = productsData
          .filter((product: any) => !product.isActive)
          .map((p: any) => p.id)

        if (disabledServiceIds.length > 0) {
          removeItemsByTypeAndIds("service", disabledServiceIds)
        }

        if (disabledProductIds.length > 0) {
          removeItemsByTypeAndIds("product", disabledProductIds)
        }
      }
    } catch (error: any) {
      logError("POS", "Error loading data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleCheckout = () => {
    if (!selectedBarber) {
      setShowBarberSelector(true)
      return
    }
    setShowCheckoutConfirm(true)
  }

  const handleBarberSelect = (barber: any) => {
    setBarber({
      id: barber.id,
      name: barber.name,
      commissionRate: barber.commissionRate
    })
    setShowBarberSelector(false)
  }

  const handleAttendance = async (type: "CHECK_IN" | "CHECK_OUT" | "PERMISSION" | "SICK" | "LEAVE") => {
    if (!attendanceBarber) {
      setAttendanceError("Silakan pilih barber")
      return
    }

    if (!barberPassword) {
      setAttendanceError("Silakan masukkan password")
      return
    }

    setAttendanceLoading(true)
    setAttendanceError(null)

    try {
      const verifyResponse = await fetch("/api/barbers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: attendanceBarber.id,
          password: barberPassword
        })
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        throw new Error(data.error || "Password salah")
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: attendanceBarber.id,
          type
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Gagal melakukan absensi")
      }

      let successMessage = ""
      switch (type) {
        case "CHECK_IN":
          successMessage = `Berhasil absen masuk - ${attendanceBarber.name}`
          break
        case "CHECK_OUT":
          successMessage = `Berhasil absen pulang - ${attendanceBarber.name}`
          break
        case "PERMISSION":
          successMessage = `Berhasil absen izin - ${attendanceBarber.name}`
          break
        case "SICK":
          successMessage = `Berhasil absen sakit - ${attendanceBarber.name}`
          break
        case "LEAVE":
          successMessage = `Berhasil absen libur - ${attendanceBarber.name}`
          break
      }

      setAttendanceSuccess(successMessage)

      setTimeout(() => {
        setShowAttendance(false)
        setAttendanceBarber(null)
        setBarberPassword("")
        setAttendanceSuccess(null)
        setAttendanceError(null)
      }, 2000)
    } catch (error: any) {
      setAttendanceError(error.message || "Gagal melakukan absensi")
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleConfirmCheckout = async () => {
    setIsProcessing(true)
    setShowCheckoutConfirm(false)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            type: item.type.toUpperCase(),
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          barberId: selectedBarber?.id || "1",
          paymentMethod: selectedPaymentMethod
        })
      })

      const result = await response.json()

      if (result.success) {
        setReceiptData({
          items: [...items],
          barber: selectedBarber,
          paymentMethod: selectedPaymentMethod,
          total: getTotal(),
          date: new Date()
        })
        clearCart()
        setShowReceipt(true)
      } else {
        alert(result.error || "Gagal melakukan checkout")
      }
    } catch (error) {
      logError("POS", "Kesalahan saat checkout", error)
      alert("Terjadi kesalahan saat checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const loadTransactions = async (date: Date) => {
    setLoadingHistory(true)
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startOfDay.toISOString(), endDate: endOfDay.toISOString() })
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      logError("POS", "Gagal memuat transaksi", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadDailySummary = async (date: Date) => {
    setLoadingSummary(true)
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const summary = await getDailySummary({
        startDate: startOfDay,
        endDate: endOfDay
      })
      setDailySummary(summary)
    } catch (error) {
      logError("POS", "Gagal memuat ringkasan harian", error)
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleViewModeChange = (mode: "pos" | "history") => {
    setViewMode(mode)
    if (mode === "history") {
      loadTransactions(selectedDate)
      loadDailySummary(selectedDate)
    }
  }

  useEffect(() => {
    if (viewMode === "history") {
      loadTransactions(selectedDate)
      loadDailySummary(selectedDate)
    }
  }, [selectedDate, viewMode])

  const isLowStock = (stock: number) => stock <= 5

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Kasir</h2>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-yellow-500 p-1">
            <Button
              size="sm"
              variant={viewMode === "pos" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("pos")}
              aria-label="Mode Input Transaksi"
              className={
                viewMode === "pos"
                  ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                  : "text-black dark:text-white hover:bg-yellow-100"
              }
            >
              <Scissors className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Input</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "history" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("history")}
              aria-label="Mode Riwayat Transaksi"
              className={
                viewMode === "history"
                  ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                  : "text-black dark:text-white hover:bg-yellow-100"
              }
            >
              <History className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Riwayat</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-2 border border-yellow-500">
            <User className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
            <span className="text-xs sm:text-sm font-medium text-black dark:text-white truncate">
              {selectedBarber ? selectedBarber.name : "Pilih Barber"}
            </span>
            {!selectedBarber && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                onClick={() => setShowBarberSelector(true)}
              >
                <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
              </Button>
            )}
          </div>
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowAttendance(true)}
            aria-label="Absen Capster"
          >
            <Check className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Absen Capster</span>
          </Button>
        </div>
      </div>

      {viewMode === "history" ? (
        <>
          <Card className="bg-white dark:bg-gray-800 border-yellow-500 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl text-black dark:text-white">Riwayat Transaksi</CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      handleDateChange(newDate)
                      loadTransactions(newDate)
                      loadDailySummary(newDate)
                    }}
                    className="border border-yellow-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-black dark:text-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-500">
                  Memuat transaksi...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada transaksi pada tanggal ini
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-yellow-500 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-black dark:text-white">
                            {new Date(transaction.date).toISOString().split('T')[0]} {String(transaction.transactionNumber).padStart(2, '0')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-yellow-500">
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Barber: {transaction.barberName}</p>
                        <p>Kasir: {transaction.cashierName}</p>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-sm font-medium text-black dark:text-white mb-2">Item:</p>
                        <div className="space-y-1">
                          {transaction.items.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm text-gray-600"
                            >
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-yellow-500 shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                Riwayat Transaksi per Hari - {selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="text-center py-8 text-gray-500">
                  Memuat ringkasan...
                </div>
              ) : dailySummary ? (
                <div className="space-y-4">
                  {dailySummary.services.length > 0 && (
                    <div>
                      <p className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-yellow-500" />
                        Layanan
                      </p>
                      <div className="space-y-2">
                        {dailySummary.services.map((service: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
                          >
                            <span className="text-sm text-black dark:text-white">{service.name}</span>
                            <span className="text-sm font-semibold text-yellow-600">{service.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailySummary.products.length > 0 && (
                    <div>
                      <p className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-yellow-500" />
                        Produk
                      </p>
                      <div className="space-y-2">
                        {dailySummary.products.map((product: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
                          >
                            <span className="text-sm text-black dark:text-white">{product.name}</span>
                            <span className="text-sm font-semibold text-yellow-600">{product.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailySummary.services.length === 0 && dailySummary.products.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada data penjualan pada tanggal ini
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : (
        <>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <Card className="bg-white dark:bg-gray-800 border-yellow-500 shadow-lg">
            <CardHeader>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "services" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("services")}
                  aria-label="Tab Layanan"
                  className={
                    activeTab === "services"
                      ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                      : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100"
                  }
                >
                  <Scissors className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Layanan</span>
                </Button>
                <Button
                  variant={activeTab === "products" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("products")}
                  aria-label="Tab Produk"
                  className={
                    activeTab === "products"
                      ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                      : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100"
                  }
                >
                  <Package className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Produk</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
                {activeTab === "services" &&
                  services.map((service) => (
                    <Button
                      key={service.id}
                      variant="outline"
                      className="h-24 flex-col border-yellow-500 hover:bg-yellow-100 text-black dark:text-white"
                      onClick={() => addItem({
                        id: service.id,
                        type: "service",
                        name: service.name,
                        price: parseFloat(service.price)
                      })}
                    >
                      <span className="text-sm font-medium text-center">{service.name}</span>
                      <span className="text-xs text-gray-600 mt-1">
                        {formatCurrency(service.price)}
                      </span>
                    </Button>
                  ))}
                {activeTab === "products" &&
                  products.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-24 flex-col border-yellow-500 hover:bg-yellow-100 text-black dark:text-white"
                      onClick={() => addItem({
                        id: product.id,
                        type: "product",
                        name: product.name,
                        price: parseFloat(product.price)
                      })}
                      disabled={product.stock === 0}
                    >
                      <span className="text-sm font-medium text-center">{product.name}</span>
                      <div className="flex flex-col items-center mt-1">
                        <span className="text-xs text-gray-600">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Stok: {product.stock}
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="bg-white dark:bg-gray-800 border-yellow-500 shadow-lg sticky top-4 lg:top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white text-lg sm:text-xl">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="hidden sm:inline">Cart</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  Keranjang kosong
                </div>
              ) : (
                <>
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-black dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-6 sm:w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs sm:text-sm font-medium w-5 sm:w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-6 sm:w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-6 sm:w-6 text-red-500 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span className="text-black dark:text-white">Total</span>
                      <span className="text-yellow-500">
                        {formatCurrency(getTotal())}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-white">Metode Pembayaran:</p>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        type="button"
                        variant={selectedPaymentMethod === "TUNAI" ? "default" : "outline"}
                        aria-label="Pembayaran Tunai"
                        className={`flex-1 ${
                          selectedPaymentMethod === "TUNAI"
                            ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                            : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100"
                        }`}
                        onClick={() => setSelectedPaymentMethod("TUNAI")}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Tunai</span>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPaymentMethod === "QRIS" ? "default" : "outline"}
                        aria-label="Pembayaran QRIS"
                        className={`flex-1 ${
                          selectedPaymentMethod === "QRIS"
                            ? "bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                            : "border-yellow-500 text-black dark:text-white hover:bg-yellow-100"
                        }`}
                        onClick={() => setSelectedPaymentMethod("QRIS")}
                      >
                        <Package className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">QRIS</span>
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-yellow-500 text-black dark:text-white hover:bg-yellow-600 font-semibold text-sm sm:text-base"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={items.length === 0}
                  >
                    Checkout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showBarberSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-black dark:text-white">Pilih Barber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {barbers.map((barber) => (
                <Button
                  key={barber.id}
                  variant="outline"
                  className="w-full justify-between border-yellow-500 hover:bg-yellow-100 text-black dark:text-white h-12 sm:h-auto"
                  onClick={() => handleBarberSelect(barber)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    <span className="text-sm sm:text-base">{barber.name}</span>
                  </div>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full text-sm sm:text-base"
                onClick={() => setShowBarberSelector(false)}
              >
                Batal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-black dark:text-white">
                <div className="text-xl sm:text-2xl font-bold mb-2">Konfirmasi Checkout</div>
                <div className="text-xs sm:text-sm font-normal text-red-500">
                  Periksa kembali pesanan Anda sebelum melanjutkan
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="border-b border-gray-200 pb-3 sm:pb-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Barber:</span>
                  <span className="font-medium text-black dark:text-white">{selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Jumlah Item:</span>
                  <span className="font-medium text-black dark:text-white">
                    {items.reduce((acc, item) => acc + item.quantity, 0)} item
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm border-b border-gray-100 pb-2">
                    <div className="flex-1">
                      <span className="text-black dark:text-white">{item.name}</span>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                        {item.type === "service" && (
                          <Badge variant="outline" className="text-xs">Layanan</Badge>
                        )}
                        {item.type === "product" && (
                          <Badge variant="outline" className="text-xs">Produk</Badge>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-black dark:text-white">
                      {formatCurrency(String(item.price * item.quantity))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Metode Pembayaran:</span>
                  <span className="font-medium text-black dark:text-white">
                    {selectedPaymentMethod === "TUNAI" ? "Tunai" : "QRIS"}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span className="text-black dark:text-white">Total Pembayaran</span>
                  <span className="text-yellow-500">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Apakah data pesanan sudah benar?
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base"
                  onClick={() => setShowCheckoutConfirm(false)}
                  disabled={isProcessing}
                >
                  Periksa Ulang
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 text-black dark:text-white hover:bg-yellow-600 text-sm sm:text-base"
                  onClick={handleConfirmCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Memproses...</span>
                      <span className="sm:hidden">Memproses</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Ya, Benar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-black dark:text-white">
                <div className="text-3xl font-bold mb-2">BARBERBRO</div>
                <div className="text-sm font-normal text-green-500">Pembayaran Berhasil!</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b border-gray-200 pb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Barber:</span>
                  <span className="font-medium text-black dark:text-white">{receiptData.barber?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium text-black dark:text-white">
                    {new Date(receiptData.date).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Metode Pembayaran:</span>
                  <span className="font-medium text-black dark:text-white">
                    {receiptData.paymentMethod === "TUNAI" ? "Tunai" : "QRIS"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {receiptData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-black dark:text-white">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {formatCurrency((parseFloat(item.price) * item.quantity).toString())}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-black dark:text-white">Total</span>
                  <span className="text-yellow-500">
                    {formatCurrency(receiptData.total)}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium text-center">
                  Terima kasih telah berkunjung!
                </p>
              </div>

              <Button
                className="w-full bg-yellow-500 text-black dark:text-white hover:bg-yellow-600"
                onClick={() => {
                  setShowReceipt(false)
                  setReceiptData(null)
                }}
              >
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Absen Capster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Capster
                </label>
                <div className="space-y-2">
                  {barbers.map((barber) => (
                    <Button
                      key={barber.id}
                      variant={attendanceBarber?.id === barber.id ? "default" : "outline"}
                      className="w-full justify-between border-yellow-500 hover:bg-yellow-100 text-black dark:text-white"
                      onClick={() => setAttendanceBarber(barber)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-yellow-500" />
                        <span>{barber.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Capster
                </label>
                <Input
                  type="password"
                  value={barberPassword}
                  onChange={(e) => setBarberPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={attendanceLoading}
                />
              </div>

              {attendanceError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{attendanceError}</p>
                </div>
              )}

              {attendanceSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <p className="text-sm text-green-800 dark:text-green-200">{attendanceSuccess}</p>
                </div>
              )}

              {!attendanceSuccess && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleAttendance("CHECK_IN")}
                    disabled={attendanceLoading || !attendanceBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Masuk"}
                  </Button>
                  <Button
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleAttendance("CHECK_OUT")}
                    disabled={attendanceLoading || !attendanceBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Pulang"}
                  </Button>
                  <Button
                    className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                    onClick={() => handleAttendance("PERMISSION")}
                    disabled={attendanceLoading || !attendanceBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Izin"}
                  </Button>
                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleAttendance("SICK")}
                    disabled={attendanceLoading || !attendanceBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Sakit"}
                  </Button>
                  <Button
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => handleAttendance("LEAVE")}
                    disabled={attendanceLoading || !attendanceBarber}
                  >
                    {attendanceLoading ? "Memproses..." : "Absen Libur"}
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowAttendance(false)
                  setAttendanceBarber(null)
                  setBarberPassword("")
                  setAttendanceError(null)
                  setAttendanceSuccess(null)
                }}
              >
                Batal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      </>
      )}
    </div>
  )
}


