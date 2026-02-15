'use client'

import * as React from 'react'

interface PullToRefreshConfig {
  onRefresh: () => Promise<void> | void
  threshold?: number
  maxPullDistance?: number
  refreshingDuration?: number
}

interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
}

export function usePullToRefresh(config: PullToRefreshConfig) {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 120,
    refreshingDuration = 1000,
  } = config

  const [state, setState] = React.useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
  })

  const startYRef = React.useRef(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const isScrolledToTop = React.useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY <= 0
  }, [])

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (state.isRefreshing || !isScrolledToTop()) return

    startYRef.current = e.touches[0].clientY
    setState((prev) => ({ ...prev, isPulling: true }))
  }, [state.isRefreshing, isScrolledToTop])

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!state.isPulling || state.isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current

      if (diff > 0 && isScrolledToTop()) {
        const pullDistance = Math.min(diff * 0.5, maxPullDistance)
        setState((prev) => ({ ...prev, pullDistance }))
      }
    },
    [state.isPulling, state.isRefreshing, isScrolledToTop, maxPullDistance]
  )

  const handleTouchEnd = React.useCallback(async () => {
    if (!state.isPulling || state.isRefreshing) return

    if (state.pullDistance >= threshold) {
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        pullDistance: threshold,
      }))

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      }

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
        }))
      }, refreshingDuration)
    } else {
      setState((prev) => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
      }))
    }
  }, [
    state.isPulling,
    state.isRefreshing,
    state.pullDistance,
    threshold,
    onRefresh,
    refreshingDuration,
  ])

  const bind = React.useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }),
    [handleTouchStart, handleTouchMove, handleTouchEnd]
  )

  const progress = Math.min(state.pullDistance / threshold, 1)

  return {
    bind,
    isRefreshing: state.isRefreshing,
    pullDistance: state.pullDistance,
    progress,
    canRefresh: state.pullDistance >= threshold,
    containerRef,
  }
}

interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  progress: number
  threshold?: number
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  progress,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  const rotation = isRefreshing ? 360 : progress * 360
  const size = 24
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  if (pullDistance <= 0 && !isRefreshing) return null

  return (
    <div
      className="flex items-center justify-center w-full overflow-hidden transition-all duration-200"
      style={{
        height: pullDistance,
        opacity: Math.min(pullDistance / 40, 1),
      }}
    >
      <div
        className={`flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
        style={{
          transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
          transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="text-blue-500"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
        </svg>
      </div>
      <span className="ml-2 text-xs text-gray-500">
        {isRefreshing ? 'Memuat...' : progress >= 1 ? 'Lepas' : 'Tarik'}
      </span>
    </div>
  )
}

interface PullToRefreshContainerProps {
  children: React.ReactNode
  onRefresh: () => Promise<void> | void
  threshold?: number
  className?: string
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  threshold = 80,
  className = '',
}: PullToRefreshContainerProps) {
  const { bind, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh,
    threshold,
  })

  return (
    <div {...bind} className={className}>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        progress={progress}
        threshold={threshold}
      />
      {children}
    </div>
  )
}
