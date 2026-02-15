import { NextResponse } from "next/server"
import { redisClient } from "./redis"
import { logError } from "./logger"

interface RateLimitData {
  count: number
  resetTime: number
}

const inMemoryStore = new Map<string, RateLimitData>()

function getRedisKey(identifier: string): string {
  return `ratelimit:${identifier}`
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
    return checkRateLimitRedis(identifier, limit, windowMs)
  }
  return checkRateLimitMemory(identifier, limit, windowMs)
}

async function checkRateLimitRedis(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: string
}> {
  if (!redisClient) {
    return checkRateLimitMemory(identifier, limit, windowMs)
  }

  const key = getRedisKey(identifier)
  const now = Date.now()
  const windowSeconds = Math.ceil(windowMs / 1000)

  try {
    const current = await redisClient.get<string>(key)
    const count = current ? parseInt(current, 10) : 0

    if (count === 0) {
      await redisClient.setex(key, windowSeconds, "1")
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: new Date(now + windowMs).toISOString(),
      }
    }

    if (count >= limit) {
      const ttl = await redisClient.ttl(key)
      const resetTime = now + (ttl > 0 ? ttl * 1000 : windowMs)
      return {
        success: false,
        limit,
        remaining: 0,
        reset: new Date(resetTime).toISOString(),
      }
    }

    await redisClient.incr(key)
    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      reset: new Date(now + windowMs).toISOString(),
    }
  } catch (error) {
    logError("RateLimit", "Redis error, falling back to in-memory", error)
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
