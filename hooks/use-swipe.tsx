'use client'

import * as React from 'react'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefaultTouchMove?: boolean
}

interface SwipeState {
  startX: number
  startY: number
  isSwiping: boolean
}

export function useSwipe(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchMove = false,
  } = config

  const stateRef = React.useRef<SwipeState>({
    startX: 0,
    startY: 0,
    isSwiping: false,
  })

  const onTouchStart = React.useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: true,
    }
  }, [])

  const onTouchEnd = React.useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!stateRef.current.isSwiping) return

      const touch = 'changedTouches' in e ? e.changedTouches[0] : e
      const deltaX = touch.clientX - stateRef.current.startX
      const deltaY = touch.clientY - stateRef.current.startY

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY && absX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else if (absY > absX && absY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }

      stateRef.current.isSwiping = false
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  )

  const onTouchMove = React.useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (preventDefaultTouchMove && stateRef.current.isSwiping) {
        e.preventDefault()
      }
    },
    [preventDefaultTouchMove]
  )

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
  }
}

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  actionWidth?: number
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  leftAction,
  rightAction,
  actionWidth = 80,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = React.useState(0)
  const [startX, setStartX] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const hasLeftAction = !!onSwipeLeft || !!leftAction
  const hasRightAction = !!onSwipeRight || !!rightAction

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }, [])

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      const currentX = e.touches[0].clientX
      const diff = currentX - startX

      if (hasLeftAction && diff < 0) {
        setTranslateX(Math.max(diff, -actionWidth))
      } else if (hasRightAction && diff > 0) {
        setTranslateX(Math.min(diff, actionWidth))
      } else if (!hasLeftAction && diff < 0) {
        setTranslateX(Math.max(diff / 3, -20))
      } else if (!hasRightAction && diff > 0) {
        setTranslateX(Math.min(diff / 3, 20))
      }
    },
    [isDragging, startX, hasLeftAction, hasRightAction, actionWidth]
  )

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false)

    if (translateX <= -actionWidth * 0.6 && hasLeftAction) {
      onSwipeLeft?.()
    } else if (translateX >= actionWidth * 0.6 && hasRightAction) {
      onSwipeRight?.()
    }

    setTranslateX(0)
  }, [
    translateX,
    actionWidth,
    hasLeftAction,
    hasRightAction,
    onSwipeLeft,
    onSwipeRight,
  ])

  const showLeftAction = translateX < -10 && leftAction
  const showRightAction = translateX > 10 && rightAction

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showLeftAction && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-red-500 text-white"
          style={{ width: Math.abs(translateX) }}
        >
          {leftAction}
        </div>
      )}
      {showRightAction && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-green-500 text-white"
          style={{ width: translateX }}
        >
          {rightAction}
        </div>
      )}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
