import { createClient } from "redis"

async function clearCache() {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
  })

  try {
    await client.connect()
    console.log("Connected to Redis")

    const keys = await client.keys("*")
    console.log(`Found ${keys.length} keys`)

    if (keys.length > 0) {
      await client.del(keys)
      console.log("Cleared all Redis cache")
    } else {
      console.log("No keys to delete")
    }

    await client.disconnect()
    console.log("Disconnected from Redis")
  } catch (error) {
    console.error("Error clearing cache:", error)
    process.exit(1)
  }
}

clearCache()
