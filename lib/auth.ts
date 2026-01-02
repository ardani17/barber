import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import type { UserRole } from "@/types"
import { prisma } from "@/lib/prisma"
import { logSecurityEvent } from "@/lib/security-logger"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000

const isProduction = process.env.NODE_ENV === "production"
const sessionMaxAge = isProduction ? 4 * 60 * 60 : 24 * 60 * 60

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user) {
          return null
        }

        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          logSecurityEvent(
            "ACCOUNT_LOCKED",
            "unknown",
            undefined,
            { userId: user.id, email: user.email, lockedUntil: user.lockedUntil }
          )
          throw new Error("Akun terkunci sementara karena terlalu banyak percobaan gagal")
        }

        const isValidPassword = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          const updatedFailedAttempts = user.failedLoginAttempts + 1
          const shouldLock = updatedFailedAttempts >= MAX_FAILED_ATTEMPTS

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: updatedFailedAttempts,
              lastFailedLogin: new Date(),
              lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION) : null
            }
          })

          if (shouldLock) {
            logSecurityEvent(
              "ACCOUNT_LOCKED",
              "unknown",
              undefined,
              { userId: user.id, email: user.email, failedAttempts: updatedFailedAttempts }
            )
            throw new Error(`Akun terkunci selama 15 menit karena terlalu banyak percobaan gagal`)
          }

          logSecurityEvent(
            "LOGIN_FAILED",
            "unknown",
            undefined,
            { userId: user.id, email: user.email, failedAttempts: updatedFailedAttempts }
          )

          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastFailedLogin: null
          }
        })

        logSecurityEvent(
          "LOGIN_SUCCESS",
          "unknown",
          undefined,
          { userId: user.id, email: user.email, role: user.role }
        )

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role as UserRole
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        maxAge: sessionMaxAge,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  useSecureCookies: isProduction,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.issuedAt = Date.now()
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      if (process.env.NODE_ENV === "production" && user) {
      }
    },
    async signOut({ token }) {
      if (process.env.NODE_ENV === "production") {
      }
    }
  }
})
