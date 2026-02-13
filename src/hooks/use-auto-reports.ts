import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Invoice, FuelEntry, Report } from '@/lib/types'
import { getMonthRange } from '@/lib/utils'

export function useAutoReports(invoices: Invoice[], fuelEntries: FuelEntry[]) {
  const [lastReportMonth, setLastReportMonth] = useKV<string>('lastMonthlyReportGenerated', '')
  const [generatedReports, setGeneratedReports] = useKV<Report[]>('generatedReports', [])

  useEffect(() => {
    const checkAndGenerateMonthlyReport = () => {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

      if (lastReportMonth !== lastMonthKey && now.getDate() >= 1) {
        const range = getMonthRange(lastMonth)

        const filteredInvoices = invoices.filter(inv => {
          const paidDate = inv.paidAt ? new Date(inv.paidAt) : null
          return paidDate && paidDate >= range.start && paidDate <= range.end
        })

        const filteredFuel = fuelEntries.filter(fuel => {
          const fuelDate = new Date(fuel.date)
          return fuelDate >= range.start && fuelDate <= range.end
        })

        if (filteredInvoices.length > 0 || filteredFuel.length > 0) {
          const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
          const totalFuelCost = filteredFuel.reduce((sum, fuel) => sum + fuel.amount, 0)
          const netProfit = totalRevenue - totalFuelCost
          const avgFuelPrice = filteredFuel.length > 0
            ? filteredFuel.reduce((sum, fuel) => sum + fuel.pricePerLiter, 0) / filteredFuel.length
            : 0
          const totalKilometers = filteredInvoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)

          const report: Report = {
            id: `auto-report-${Date.now()}`,
            type: 'monthly',
            startDate: range.start.toISOString(),
            endDate: range.end.toISOString(),
            generatedAt: now.toISOString(),
            totalRevenue,
            totalFuelCost,
            netProfit,
            invoicesCount: filteredInvoices.length,
            fuelEntriesCount: filteredFuel.length,
            avgFuelPrice,
            totalKilometers,
          }

          setGeneratedReports(current => [...(current || []), report])
          setLastReportMonth(lastMonthKey)

          console.log('Auto-generated monthly report:', report)
        }
      }
    }

    const timer = setTimeout(checkAndGenerateMonthlyReport, 2000)

    return () => clearTimeout(timer)
  }, [invoices, fuelEntries, lastReportMonth, setLastReportMonth, setGeneratedReports])

  return { generatedReports }
}
