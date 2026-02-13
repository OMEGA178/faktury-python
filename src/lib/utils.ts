import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function validateNIP(nip: string): boolean {
  const cleanNip = nip.replace(/[^0-9]/g, '')
  
  if (cleanNip.length !== 10) {
    return false
  }
  
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i], 10) * weights[i]
  }
  
  const checksum = sum % 11
  const lastDigit = parseInt(cleanNip[9], 10)
  
  return checksum === lastDigit
}

export function formatNIP(nip: string): string {
  const cleanNip = nip.replace(/[^0-9]/g, '')
  if (cleanNip.length !== 10) return nip
  return `${cleanNip.slice(0, 3)}-${cleanNip.slice(3, 6)}-${cleanNip.slice(6, 8)}-${cleanNip.slice(8, 10)}`
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date))
}

export function isOverdue(deadline: string, issueDate?: string, paymentTermStart?: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (issueDate && paymentTermStart !== undefined) {
    const issue = new Date(issueDate)
    const startDate = new Date(issue)
    startDate.setDate(startDate.getDate() + paymentTermStart)
    
    return startDate < today
  }
  
  return new Date(deadline) < today
}

export function calculateScore(paidOnTime: boolean): number {
  return paidOnTime ? 10 : -5
}

export function getScoreLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 50) return 'excellent'
  if (score >= 20) return 'good'
  if (score >= 0) return 'fair'
  return 'poor'
}

export function getCurrentDateTime(): { date: string; time: string; full: string } {
  const now = new Date()
  const date = now.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  const time = now.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const full = now.toLocaleString('pl-PL')
  return { date, time, full }
}

export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function shouldNotifyUpcoming(deadline: string, notifyDaysBefore: number = 3): boolean {
  const daysLeft = getDaysUntilDeadline(deadline)
  return daysLeft > 0 && daysLeft <= notifyDaysBefore
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
  }
  return phone
}

export async function calculateDistance(from: string, to: string): Promise<number> {
  try {
    const promptText = `Calculate the approximate road distance in kilometers between ${from} and ${to} in Poland. Return ONLY a number representing kilometers, nothing else.`
    const result = await window.spark.llm(promptText, 'gpt-4o-mini')
    const distance = parseInt(result.trim())
    return isNaN(distance) ? 0 : distance
  } catch (error) {
    return 0
  }
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

export function getQuarterRange(date: Date): { start: Date; end: Date } {
  const quarter = Math.floor(date.getMonth() / 3)
  const start = new Date(date.getFullYear(), quarter * 3, 1)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date.getFullYear(), quarter * 3 + 3, 0)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const endStr = end.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

export function calculateTripCostPerKm(params: {
  revenue: number
  distance: number
  fuelCost?: number
  driverDailyCost?: number
  tripDays?: number
  forwarderCost?: number
}): {
  revenuePerKm: number
  fuelCostPerKm: number
  driverCostPerKm: number
  forwarderCostPerKm: number
  netProfitPerKm: number
  totalCosts: number
  netProfit: number
} {
  const { revenue, distance, fuelCost = 0, driverDailyCost = 0, tripDays = 1, forwarderCost = 0 } = params
  
  if (distance === 0) {
    return { 
      revenuePerKm: 0, 
      fuelCostPerKm: 0, 
      driverCostPerKm: 0, 
      forwarderCostPerKm: 0,
      netProfitPerKm: 0,
      totalCosts: 0,
      netProfit: 0
    }
  }

  const totalDriverCost = driverDailyCost * tripDays
  const totalCosts = fuelCost + totalDriverCost + forwarderCost
  const netProfit = revenue - totalCosts

  return {
    revenuePerKm: revenue / distance,
    fuelCostPerKm: fuelCost / distance,
    driverCostPerKm: totalDriverCost / distance,
    forwarderCostPerKm: forwarderCost / distance,
    netProfitPerKm: netProfit / distance,
    totalCosts,
    netProfit
  }
}
