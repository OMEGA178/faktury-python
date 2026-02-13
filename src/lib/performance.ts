export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private startTimes: Map<string, number> = new Map()

  start(label: string): void {
    this.startTimes.set(label, performance.now())
  }

  end(label: string): number {
    const startTime = this.startTimes.get(label)
    if (!startTime) {
      console.warn(`No start time found for ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(label)

    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)

    return duration
  }

  measure<T>(label: string, fn: () => T): T {
    this.start(label)
    try {
      return fn()
    } finally {
      this.end(label)
    }
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    try {
      return await fn()
    } finally {
      this.end(label)
    }
  }

  getStats(label: string): {
    count: number
    average: number
    min: number
    max: number
    total: number
  } | null {
    const times = this.metrics.get(label)
    if (!times || times.length === 0) {
      return null
    }

    const total = times.reduce((sum, time) => sum + time, 0)
    const average = total / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)

    return {
      count: times.length,
      average,
      min,
      max,
      total,
    }
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}
    for (const label of this.metrics.keys()) {
      stats[label] = this.getStats(label)
    }
    return stats
  }

  printStats(label?: string): void {
    if (label) {
      const stats = this.getStats(label)
      if (stats) {
        console.group(`Performance: ${label}`)
        console.log(`Count: ${stats.count}`)
        console.log(`Average: ${stats.average.toFixed(2)}ms`)
        console.log(`Min: ${stats.min.toFixed(2)}ms`)
        console.log(`Max: ${stats.max.toFixed(2)}ms`)
        console.log(`Total: ${stats.total.toFixed(2)}ms`)
        console.groupEnd()
      }
    } else {
      console.group('Performance Stats')
      const allStats = this.getAllStats()
      for (const [metricLabel, stats] of Object.entries(allStats)) {
        if (stats) {
          console.log(
            `${metricLabel}: avg=${stats.average.toFixed(2)}ms, count=${stats.count}`
          )
        }
      }
      console.groupEnd()
    }
  }

  clear(label?: string): void {
    if (label) {
      this.metrics.delete(label)
      this.startTimes.delete(label)
    } else {
      this.metrics.clear()
      this.startTimes.clear()
    }
  }
}

export const perfMonitor = new PerformanceMonitor()

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export function measureRenderTime(componentName: string): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('measure')
    const componentEntries = entries.filter((entry) =>
      entry.name.includes(componentName)
    )

    if (componentEntries.length > 0) {
      const totalTime = componentEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      )
      const avgTime = totalTime / componentEntries.length
      console.log(
        `${componentName} - Renders: ${componentEntries.length}, Avg: ${avgTime.toFixed(2)}ms`
      )
    }
  }
}

export function logMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory
    console.group('Memory Usage')
    console.log(`Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`)
    console.log(`Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`)
    console.log(`Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`)
    console.groupEnd()
  }
}

export const createBatchProcessor = <T>(
  processFn: (items: T[]) => void | Promise<void>,
  batchSize: number = 10,
  delay: number = 100
) => {
  let queue: T[] = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const processBatch = async () => {
    if (queue.length === 0) return

    const batch = queue.splice(0, batchSize)
    await processFn(batch)

    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, delay)
    }
  }

  return {
    add: (item: T) => {
      queue.push(item)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(processBatch, delay)
    },
    flush: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      return processBatch()
    },
  }
}
