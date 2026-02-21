'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error:', error)
    
    // Check if it's a chunk loading error
    const isChunkError = 
      /Loading chunk [\d]+ failed/.test(error.message) ||
      /Loading CSS chunk [\d]+ failed/.test(error.message) ||
      /Failed to load chunk/.test(error.message) ||
      /missing from the server/.test(error.message) ||
      error.message.includes('chunk')

    if (isChunkError) {
      console.log('Chunk loading error detected in GlobalError, attempting reload...')
      // Use window.location.href to force a full reload from server, bypassing cache
      window.location.href = window.location.href
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-6">
              Maaf, terjadi kesalahan saat memuat aplikasi. Kemungkinan ada pembaruan versi.
              Silakan coba muat ulang halaman.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="bg-gray-100 p-2 rounded text-xs text-left overflow-auto mb-4 max-h-40">
                {error.message}
              </pre>
            )}
            <button
              onClick={() => {
                // Force reload from server
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
