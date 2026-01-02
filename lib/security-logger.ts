type SecurityEventType = 
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED"
  | "RATE_LIMIT_EXCEEDED"
  | "UNAUTHORIZED_ACCESS"
  | "SUSPICIOUS_ACTIVITY"

interface SecurityLogData {
  type: SecurityEventType
  userId?: string
  email?: string
  ipAddress: string
  userAgent?: string
  timestamp: Date
  details?: Record<string, any>
}

class SecurityLogger {
  private isProduction = process.env.NODE_ENV === "production"

  log(event: SecurityLogData) {
    const logEntry = {
      ...event,
      timestamp: event.timestamp.toISOString(),
      environment: this.isProduction ? "production" : "development"
    }

    if (this.isProduction) {
      this.writeToStorage(logEntry)
    } else {
      this.writeToConsole(logEntry)
    }
  }

  private writeToStorage(logEntry: any) {
  }

  private writeToConsole(logEntry: any) {
    const prefix = `[SECURITY][${logEntry.type}]`
    const message = `${prefix} User: ${logEntry.email || logEntry.userId || "anonymous"} | IP: ${logEntry.ipAddress}`
    
    if (logEntry.type === "LOGIN_SUCCESS") {
      console.log(message)
    } else if (logEntry.type === "LOGIN_FAILED") {
      console.warn(message)
    } else {
      console.error(message)
    }
  }
}

export const securityLogger = new SecurityLogger()

export const logSecurityEvent = (
  type: SecurityEventType,
  ipAddress: string,
  userAgent?: string,
  additionalData?: Record<string, any>
) => {
  securityLogger.log({
    type,
    ipAddress,
    userAgent,
    timestamp: new Date(),
    ...additionalData
  })
}