'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandableCardProps {
  children: React.ReactNode
  summary: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  onExpand?: () => void
}

export function ExpandableCard({
  children,
  summary,
  defaultExpanded = false,
  className,
  onExpand,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  const handleToggle = () => {
    if (!isExpanded && onExpand) {
      onExpand()
    }
    setIsExpanded(!isExpanded)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200',
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">{summary}</div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 mt-1',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isExpanded}
      >
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ExpandableSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  badge?: React.ReactNode
}

export function ExpandableSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  className,
  badge,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
      >
        <div className="p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="font-semibold text-gray-900 truncate">{title}</span>
            {badge}
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isExpanded}
      >
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}
