'use client'

import { WifiOff, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflineContent() {
  return (
    <main id="main-content" role="main" aria-label="Konten utama" className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-destructive/10 rounded-full p-6">
              <WifiOff className="h-16 w-16 text-destructive" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Tidak Ada Koneksi
          </h1>
          <p className="text-muted-foreground">
            Sepertinya Anda sedang offline. Periksa koneksi internet Anda dan coba lagi.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Tips:</p>
          <ul className="text-left space-y-1 list-disc list-inside">
            <li>Periksa koneksi WiFi atau data seluler Anda</li>
            <li>Coba aktifkan mode pesawat, lalu nonaktifkan kembali</li>
            <li>Pastikan Anda tidak dalam mode offline browser</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="gap-2 min-h-11"
            aria-label="Coba muat ulang halaman"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 min-h-11"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/"}
            className="gap-2 min-h-11"
            aria-label="Kembali ke halaman utama"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Beranda
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Beberapa data mungkin tersedia dari cache
        </p>
      </div>
    </main>
  )
}
