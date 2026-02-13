/**
 * Pomocnik do logowania w trybie development
 * W produkcji wszystkie logi są wyłączone
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const devLog = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  }
}

// Zawsze loguj błędy (nawet w produkcji, ale tylko do console.error)
export const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`, error)
}

// Zawsze loguj ważne informacje systemowe
export const logSystem = (message: string, ...args: any[]) => {
  console.log(`[SYSTEM] ${message}`, ...args)
}
