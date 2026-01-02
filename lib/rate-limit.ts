import { NextResponse } from "next/server";

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 10000
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: string;
}> {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  const existingData = rateLimitStore.get(identifier);
  
  if (!existingData || now > existingData.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: new Date(resetTime).toISOString(),
    };
  }
  
  if (existingData.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: new Date(existingData.resetTime).toISOString(),
    };
  }
  
  existingData.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - existingData.count,
    reset: new Date(existingData.resetTime).toISOString(),
  };
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
  );
}

export function clearExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(clearExpiredEntries, 60000);
