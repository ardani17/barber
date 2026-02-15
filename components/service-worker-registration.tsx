'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerRegistrationProps {
  onRegistration?: (registration: ServiceWorkerRegistration | undefined) => void
  onUpdate?: (registration: ServiceWorkerRegistration | undefined) => void
}

export function ServiceWorkerRegistration({
  onRegistration,
  onUpdate,
}: ServiceWorkerRegistrationProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'ononline' in window) {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      setRegistration(reg)
      onRegistration?.(reg)

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdateBanner(true)
              onUpdate?.(reg)
            }
          })
        }
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.error('[SW] Registration failed:', error)
    }
  }

  async function handleUpdate() {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowUpdateBanner(false)
  }

  function handleDismissUpdate() {
    setShowUpdateBanner(false)
  }

  return (
    <>
      {!isOnline && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 px-4 py-3 text-center text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
      )}

      {showUpdateBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <p className="text-sm font-medium">
              Versi baru tersedia!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDismissUpdate}
                className="text-sm underline opacity-80 hover:opacity-100 min-h-11 min-w-11 px-3"
                aria-label="Tutup notifikasi update"
              >
                Nanti
              </button>
              <button
                onClick={handleUpdate}
                className="bg-primary-foreground text-primary text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-foreground/90 min-h-11"
                aria-label="Update aplikasi sekarang"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
