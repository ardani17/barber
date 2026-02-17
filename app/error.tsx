"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCw, Home, Phone } from "lucide-react"
import { useEffect } from "react"
import { logError } from "@/lib/logger"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError("ErrorBoundary", "Unhandled error", error)

    // Auto-reload if chunk failure detected
    const isChunkError =
      error.message?.toLowerCase().includes("chunk") ||
      error.message?.toLowerCase().includes("loading") ||
      error.message?.toLowerCase().includes("failed to load");

    if (isChunkError) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Terjadi Kesalahan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Maaf, terjadi kesalahan yang tidak terduga. Tim BARBERBRO sedang memperbaiki masalah ini.
        </p>
        {error.message && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-8 font-mono bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold text-lg"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Butuh bantuan segera?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hubungi BARBERBRO langsung untuk booking atau informasi layanan
          </p>
          <a
            href="tel:+6281234567890"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            <Phone className="w-4 h-4" />
            +62 812-3456-7890
          </a>
        </div>
      </div>
    </div>
  )
}