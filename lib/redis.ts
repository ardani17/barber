import { createClient, type RedisClientType } from "redis"

let redisClient: RedisClientType | null = null

const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn("REDIS_URL not configured, caching disabled")
    return null
  }

  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient({
      url: redisUrl
    })

    redisClient.on("error", (err) => console.error("Redis Client Error:", err))

    redisClient.connect().catch((err) => {
      console.error("Redis Connection Error:", err)
      redisClient = null
    })

    return redisClient
  } catch (error) {
    console.error("Failed to initialize Redis:", error)
    return null
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient()

  if (!client) return null

  try {
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCache<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  const client = getRedisClient()

  if (!client) return false

  try {
    if (ttl) {
      await client.setEx(key, ttl, JSON.stringify(value))
    } else {
      await client.set(key, JSON.stringify(value))
    }
    return true
  } catch (error) {
    console.error("Redis set error:", error)
    return false
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient()

  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    console.error("Redis delete error:", error)
    return false
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<boolean> {
  const client = getRedisClient()

  if (!client) return false

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(keys)
    }
    return true
  } catch (error) {
    console.error("Redis delete pattern error:", error)
    return false
  }
}

export async function invalidateDashboardCache(): Promise<boolean> {
  return deleteCacheByPattern("dashboard:*")
}

export async function invalidateTransactionCache(): Promise<boolean> {
  return deleteCacheByPattern("transactions:*")
}

export async function invalidateExpenseCache(): Promise<boolean> {
  return deleteCacheByPattern("expenses:*")
}
