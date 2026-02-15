import { Redis } from "@upstash/redis"
import { logWarn } from "./logger"

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    logWarn("Redis", "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set, falling back to in-memory rate limiting")
    return null
  }

  redis = new Redis({
    url,
    token,
  })

  return redis
}

export const redisClient = getRedisClient()
