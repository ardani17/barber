import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { logSecurityEvent } from "@/lib/security-logger"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (process.env.NODE_ENV === "production" && request.headers.get("x-forwarded-proto") !== "https") {
    return NextResponse.redirect(
      new URL(`https://${request.headers.get("host")}${pathname}`, request.url),
      301
    )
  }
  
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown"

  if (pathname === "/login" && request.method === "POST") {
    const rateLimitResult = await checkRateLimit(`login:${ip}`, 5, 60000)
    
    if (!rateLimitResult.success) {
      logSecurityEvent(
        "RATE_LIMIT_EXCEEDED",
        ip,
        request.headers.get("user-agent") || undefined,
        { path: pathname, endpoint: "login" }
      )
      return rateLimitResponse(ip)
    }
  }

  if (pathname === "/register" && request.method === "POST") {
    const rateLimitResult = await checkRateLimit(`register:${ip}`, 3, 3600000)
    
    if (!rateLimitResult.success) {
      logSecurityEvent(
        "RATE_LIMIT_EXCEEDED",
        ip,
        request.headers.get("user-agent") || undefined,
        { path: pathname, endpoint: "register" }
      )
      return rateLimitResponse(ip)
    }
  }

  const session = await auth()

  const isPublicRoute = ["/login", "/register"].includes(pathname)
  const isPosRoute = pathname.startsWith("/pos")
  const isOwnerRoute = pathname.startsWith("/dashboard") || 
                      pathname.startsWith("/transactions") ||
                      pathname.startsWith("/inventory") ||
                      pathname.startsWith("/salaries") ||
                      pathname.startsWith("/settings")

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session) {
    if (isOwnerRoute && session.user.role !== "OWNER") {
      logSecurityEvent(
        "UNAUTHORIZED_ACCESS",
        ip,
        request.headers.get("user-agent") || undefined,
        { userId: session.user.id, email: session.user.email, path: pathname, attemptedRole: "OWNER" }
      )
      return NextResponse.redirect(new URL("/pos", request.url))
    }

    if (isPosRoute && session.user.role !== "CASHIER" && session.user.role !== "OWNER") {
      logSecurityEvent(
        "UNAUTHORIZED_ACCESS",
        ip,
        request.headers.get("user-agent") || undefined,
        { userId: session.user.id, email: session.user.email, path: pathname, attemptedRole: "CASHIER/OWNER" }
      )
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
