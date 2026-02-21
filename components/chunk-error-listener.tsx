'use client'

import { useEffect } from 'react'

export function ChunkErrorListener() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message
      if (
        /Loading chunk [\d]+ failed/.test(error?.toString()) ||
        /Loading CSS chunk [\d]+ failed/.test(error?.toString()) ||
        /Failed to load chunk/.test(error?.toString()) ||
        /missing from the server/.test(error?.toString())
      ) {
        console.error('Chunk load error detected, reloading page...', error)
        
        // Cek apakah baru saja reload untuk menghindari loop
        const lastReload = sessionStorage.getItem('chunk_reload_ts')
        const now = Date.now()
        
        if (!lastReload || now - parseInt(lastReload) > 10000) {
           sessionStorage.setItem('chunk_reload_ts', String(now))
           window.location.reload()
        }
      }
    }

    // Catch errors on the window
    window.addEventListener('error', handleError)
    
    // Also catch unhandled promise rejections (often how dynamic imports fail)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      if (
        /Loading chunk [\d]+ failed/.test(error?.toString()) ||
        /Loading CSS chunk [\d]+ failed/.test(error?.toString()) ||
        /Failed to load chunk/.test(error?.toString()) ||
        /missing from the server/.test(error?.toString())
      ) {
        console.error('Chunk load promise rejection detected, reloading page...', error)
        
        // Cek apakah baru saja reload untuk menghindari loop
        const lastReload = sessionStorage.getItem('chunk_reload_ts')
        const now = Date.now()
        
        if (!lastReload || now - parseInt(lastReload) > 10000) {
           sessionStorage.setItem('chunk_reload_ts', String(now))
           window.location.reload()
        }
      }
    }
    
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
