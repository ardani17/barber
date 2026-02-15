type LogLevel = "debug" | "info" | "warn" | "error"

const isDevelopment = process.env.NODE_ENV === "development"

function shouldLog(level: LogLevel): boolean {
  if (isDevelopment) return true

  return level === "warn" || level === "error"
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`
  
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data)}`
  }
  return `${prefix} ${message}`
}

export const logger = {
  debug: (context: string, message: string, data?: unknown) => {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", context, message, data))
    }
  },

  info: (context: string, message: string, data?: unknown) => {
    if (shouldLog("info")) {
      console.info(formatMessage("info", context, message, data))
    }
  },

  warn: (context: string, message: string, data?: unknown) => {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", context, message, data))
    }
  },

  error: (context: string, message: string, error?: unknown) => {
    if (shouldLog("error")) {
      const errorData = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : error
      console.error(formatMessage("error", context, message, errorData))
    }
  },
}

export function logDebug(context: string, message: string, data?: unknown) {
  logger.debug(context, message, data)
}

export function logInfo(context: string, message: string, data?: unknown) {
  logger.info(context, message, data)
}

export function logWarn(context: string, message: string, data?: unknown) {
  logger.warn(context, message, data)
}

export function logError(context: string, message: string, error?: unknown) {
  logger.error(context, message, error)
}
