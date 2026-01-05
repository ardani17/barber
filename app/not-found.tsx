import Link from "next/link"
import { Scissors, Home, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <Scissors className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia. Mari kita kembali ke BARBERBRO untuk layanan potong rambut terbaik.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <a 
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-lg"
          >
            Hubungi Kami
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  )
}