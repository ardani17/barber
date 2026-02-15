import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { redisClient } from "./redis"
import { logError, logInfo } from "./logger"

interface RateLimitData {
  count: number
  resetTime: number
}

const inMemoryStore = new Map<string, RateLimitData>()

let ratelimit: Ratelimit | null = null

function getRatelimit(windowMs: number = 10000, limit: number = 5): Ratelimit | null {
  if (!redisClient) return null

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
      analytics: true,
      prefix: "baberv3:ratelimit",
    })
    logInfo("RateLimit", "Upstash Ratelimit initialized", { limit, windowMs })
  }

  return ratelimit
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 10000
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: string
}> {
  if (redisClient) {
    return checkRateLimitUpstash(identifier, limit, windowMs)
  }
  return checkRateLimitMemory(identifier, limit, windowMs)
}

async function checkRateLimitUpstash(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: string
}> {
  try {
    const limiter = getRatelimit(windowMs, limit)
    
    if (!limiter) {
      return checkRateLimitMemory(identifier, limit, windowMs)
    }

    const { success, remaining, reset } = await limiter.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset: new Date(reset).toISOString(),
    }
  } catch (error) {
    logError("RateLimit", "Upstash error, falling back to in-memory", error)
    return checkRateLimitMemory(identifier, limit, windowMs)
  }
}

function checkRateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: string
}> {
  const now = Date.now()
  const resetTime = now + windowMs

  const existingData = inMemoryStore.get(identifier)

  if (!existingData || now > existingData.resetTime) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetTime,
    })

    return Promise.resolve({
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(resetTime).toISOString(),
    })
  }

  if (existingData.count >= limit) {
    return Promise.resolve({
      success: false,
      limit,
      remaining: 0,
      reset: new Date(existingData.resetTime).toISOString(),
    })
  }

  existingData.count++

  return Promise.resolve({
    success: true,
    limit,
    remaining: limit - existingData.count,
    reset: new Date(existingData.resetTime).toISOString(),
  })
}

export function rateLimitResponse(identifier: string) {
  return NextResponse.json(
    { success: false, error: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": "0",
        "Retry-After": "10",
      },
    }
  )
}

function clearExpiredEntries() {
  const now = Date.now()
  for (const [key, data] of inMemoryStore.entries()) {
    if (now > data.resetTime) {
      inMemoryStore.delete(key)
    }
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(clearExpiredEntries, 60000)
}
