import { unstable_cache } from "next/cache"

type CacheOptions = {
  tags?: string[]
  revalidate?: number
}

const DEFAULT_REVALIDATE = 60

export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: CacheOptions = {}
): T {
  const { tags = [], revalidate = DEFAULT_REVALIDATE } = options

  return unstable_cache(fn as (...args: unknown[]) => Promise<Awaited<ReturnType<T>>>, tags, {
    revalidate,
    tags
  }) as T
}

export function createCacheKey(prefix: string, ...parts: (string | number | Date | undefined)[]): string[] {
  const keyParts = parts
    .filter((part): part is string | number | Date => part !== undefined)
    .map(part => {
      if (part instanceof Date) {
        return part.toISOString().split("T")[0]
      }
      return String(part)
    })
  
  return [prefix, ...keyParts]
}

export const CACHE_TAGS = {
  DASHBOARD: "dashboard",
  TRANSACTIONS: "transactions",
  EXPENSES: "expenses",
  BARBERS: "barbers",
  PRODUCTS: "products",
  SERVICES: "services"
} as const

export const CACHE_TTL = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120,
  HOUR: 3600
} as const
