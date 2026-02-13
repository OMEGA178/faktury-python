import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Invoice, FuelEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendUp, 
  TrendDown, 
  Target, 
  GasPump, 
  ChartLine,
  CurrencyCircleDollar,
  Warning
} from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

interface BalanceTabProps {
  invoices: Invoice[]
  fuelEntries: FuelEntry[]
}

const BUSINESS_PLAN_METRICS = {
  breakEvenMonthly: 12000,
  targetRevenueMin: 12000,
  targetRevenueMax: 15000,
  targetProfitMarginMin: 51,
  targetProfitMarginMax: 58,
  targetFuelPricePerLiter: 6.50,
  targetMonthlyKm: 13500,
  avgRevenuePerKm: 3.20,
}

const COLORS = {
  revenue: 'oklch(0.45 0.18 250)',
  fuel: 'oklch(0.55 0.22 25)',
  profit: 'oklch(0.50 0.16 160)',
  target: 'oklch(0.50 0.12 200)',
}

export function BalanceTab({ invoices, fuelEntries }: BalanceTabProps) {
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { revenue: number; fuel: number; profit: number; invoices: number } } = {}

    invoices.filter(inv => inv.isPaid && inv.paidAt).forEach(inv => {
      const date = new Date(inv.paidAt!)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, fuel: 0, profit: 0, invoices: 0 }
      }
      
      months[monthKey].revenue += inv.amount
      months[monthKey].invoices += 1
    })

    fuelEntries.forEach(fuel => {
      const date = new Date(fuel.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, fuel: 0, profit: 0, invoices: 0 }
      }
      
      months[monthKey].fuel += fuel.amount
    })

    Object.keys(months).forEach(key => {
      months[key].profit = months[key].revenue - months[key].fuel
    })

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
        'Przychody': data.revenue,
        'Koszty paliwa': data.fuel,
        'Zysk netto': data.profit,
      }))
  }, [invoices, fuelEntries])

  const currentMonthStats = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    const revenue = invoices
      .filter(inv => inv.isPaid && inv.paidAt)
      .filter(inv => {
        const date = new Date(inv.paidAt!)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === currentMonth
      })
      .reduce((sum, inv) => sum + inv.amount, 0)

    const fuel = fuelEntries
      .filter(fuel => {
        const date = new Date(fuel.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === currentMonth
      })
      .reduce((sum, fuel) => sum + fuel.amount, 0)

    const totalKm = invoices
      .filter(inv => inv.isPaid && inv.paidAt)
      .filter(inv => {
        const date = new Date(inv.paidAt!)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === currentMonth
      })
      .reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)

    const totalLiters = fuelEntries
      .filter(fuel => {
        const date = new Date(fuel.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === currentMonth
      })
      .reduce((sum, fuel) => sum + fuel.liters, 0)

    const profit = revenue - fuel
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
    const revenuePerKm = totalKm > 0 ? revenue / totalKm : 0
    const fuelCostPerKm = totalKm > 0 ? fuel / totalKm : 0

    return { revenue, fuel, profit, profitMargin, totalKm, totalLiters, revenuePerKm, fuelCostPerKm }
  }, [invoices, fuelEntries])

  const previousMonthStats = useMemo(() => {
    const now = new Date()
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    
    const revenue = invoices
      .filter(inv => inv.isPaid && inv.paidAt)
      .filter(inv => {
        const date = new Date(inv.paidAt!)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === previousMonth
      })
      .reduce((sum, inv) => sum + inv.amount, 0)

    const fuel = fuelEntries
      .filter(fuel => {
        const date = new Date(fuel.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === previousMonth
      })
      .reduce((sum, fuel) => sum + fuel.amount, 0)

    const totalKm = invoices
      .filter(inv => inv.isPaid && inv.paidAt)
      .filter(inv => {
        const date = new Date(inv.paidAt!)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === previousMonth
      })
      .reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)

    const totalLiters = fuelEntries
      .filter(fuel => {
        const date = new Date(fuel.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return monthKey === previousMonth
      })
      .reduce((sum, fuel) => sum + fuel.liters, 0)

    const profit = revenue - fuel
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
    const revenuePerKm = totalKm > 0 ? revenue / totalKm : 0
    const fuelCostPerKm = totalKm > 0 ? fuel / totalKm : 0

    return { revenue, fuel, profit, profitMargin, totalKm, totalLiters, revenuePerKm, fuelCostPerKm }
  }, [invoices, fuelEntries])

  const monthComparison = useMemo(() => {
    const revenueChange = previousMonthStats.revenue > 0 
      ? ((currentMonthStats.revenue - previousMonthStats.revenue) / previousMonthStats.revenue) * 100 
      : 0
    const fuelChange = previousMonthStats.fuel > 0 
      ? ((currentMonthStats.fuel - previousMonthStats.fuel) / previousMonthStats.fuel) * 100 
      : 0
    const profitChange = previousMonthStats.profit > 0 
      ? ((currentMonthStats.profit - previousMonthStats.profit) / previousMonthStats.profit) * 100 
      : 0
    const revenuePerKmChange = previousMonthStats.revenuePerKm > 0
      ? ((currentMonthStats.revenuePerKm - previousMonthStats.revenuePerKm) / previousMonthStats.revenuePerKm) * 100
      : 0
    const fuelCostPerKmChange = previousMonthStats.fuelCostPerKm > 0
      ? ((currentMonthStats.fuelCostPerKm - previousMonthStats.fuelCostPerKm) / previousMonthStats.fuelCostPerKm) * 100
      : 0

    return { 
      revenueChange, 
      fuelChange, 
      profitChange, 
      revenuePerKmChange,
      fuelCostPerKmChange,
      hasPreviousData: previousMonthStats.revenue > 0 || previousMonthStats.fuel > 0
    }
  }, [currentMonthStats, previousMonthStats])

  const fuelPriceAnalysis = useMemo(() => {
    const avgPrice = fuelEntries.length > 0
      ? fuelEntries.reduce((sum, fuel) => sum + fuel.pricePerLiter, 0) / fuelEntries.length
      : 0

    const monthlyPrices: { [key: string]: { sum: number; count: number } } = {}

    fuelEntries.forEach(fuel => {
      const date = new Date(fuel.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyPrices[monthKey]) {
        monthlyPrices[monthKey] = { sum: 0, count: 0 }
      }
      
      monthlyPrices[monthKey].sum += fuel.pricePerLiter
      monthlyPrices[monthKey].count += 1
    })

    const priceHistory = Object.entries(monthlyPrices)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
        'Cena za litr': data.sum / data.count,
        'Cel': BUSINESS_PLAN_METRICS.targetFuelPricePerLiter,
      }))

    return { avgPrice, priceHistory }
  }, [fuelEntries])

  const breakEvenAnalysis = useMemo(() => {
    const totalRevenue = invoices.filter(inv => inv.isPaid).reduce((sum, inv) => sum + inv.amount, 0)
    const remainingToBreakEven = Math.max(0, BUSINESS_PLAN_METRICS.breakEvenMonthly - currentMonthStats.revenue)
    const percentageToBreakEven = (currentMonthStats.revenue / BUSINESS_PLAN_METRICS.breakEvenMonthly) * 100

    return {
      totalRevenue,
      remainingToBreakEven,
      percentageToBreakEven,
      isAboveBreakEven: currentMonthStats.revenue >= BUSINESS_PLAN_METRICS.breakEvenMonthly
    }
  }, [invoices, currentMonthStats])

  const distributionData = [
    { name: 'Zysk netto', value: currentMonthStats.profit > 0 ? currentMonthStats.profit : 0 },
    { name: 'Koszty paliwa', value: currentMonthStats.fuel },
  ]

  const DIST_COLORS = [COLORS.profit, COLORS.fuel]

  return (
    <div className="space-y-6">
      {monthComparison.hasPreviousData && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={24} weight="duotone" className="text-primary" />
              Porównanie z poprzednim miesiącem
            </CardTitle>
            <CardDescription>
              Analiza zmian finansowych i operacyjnych miesiąc do miesiąca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Przychody</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${monthComparison.revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthComparison.revenueChange >= 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {Math.abs(monthComparison.revenueChange).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{formatCurrency(currentMonthStats.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{formatCurrency(previousMonthStats.revenue)}</span>
                  </div>
                </div>
                {monthComparison.revenueChange !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {monthComparison.revenueChange > 0 ? 'Wzrost' : 'Spadek'} o {formatCurrency(Math.abs(currentMonthStats.revenue - previousMonthStats.revenue))}
                  </p>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Wydatki na paliwo</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${monthComparison.fuelChange <= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthComparison.fuelChange > 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {Math.abs(monthComparison.fuelChange).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{formatCurrency(currentMonthStats.fuel)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{formatCurrency(previousMonthStats.fuel)}</span>
                  </div>
                </div>
                {monthComparison.fuelChange !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {monthComparison.fuelChange > 0 ? 'Wzrost' : 'Mniejsze'} wydatki o {formatCurrency(Math.abs(currentMonthStats.fuel - previousMonthStats.fuel))}
                  </p>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Zysk netto</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${monthComparison.profitChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthComparison.profitChange >= 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {Math.abs(monthComparison.profitChange).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{formatCurrency(currentMonthStats.profit)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{formatCurrency(previousMonthStats.profit)}</span>
                  </div>
                </div>
                {monthComparison.profitChange !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {monthComparison.profitChange > 0 ? 'Wzrost' : 'Spadek'} o {formatCurrency(Math.abs(currentMonthStats.profit - previousMonthStats.profit))}
                  </p>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Przychód za km</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${monthComparison.revenuePerKmChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthComparison.revenuePerKmChange >= 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {Math.abs(monthComparison.revenuePerKmChange).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{currentMonthStats.revenuePerKm > 0 ? formatCurrency(currentMonthStats.revenuePerKm) + '/km' : 'Brak danych'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{previousMonthStats.revenuePerKm > 0 ? formatCurrency(previousMonthStats.revenuePerKm) + '/km' : 'Brak danych'}</span>
                  </div>
                </div>
                {monthComparison.revenuePerKmChange !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {monthComparison.revenuePerKmChange > 0 ? 'Większy' : 'Mniejszy'} przychód o {formatCurrency(Math.abs(currentMonthStats.revenuePerKm - previousMonthStats.revenuePerKm))}/km
                  </p>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Koszt paliwa za km</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${monthComparison.fuelCostPerKmChange <= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthComparison.fuelCostPerKmChange > 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {Math.abs(monthComparison.fuelCostPerKmChange).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{currentMonthStats.fuelCostPerKm > 0 ? formatCurrency(currentMonthStats.fuelCostPerKm) + '/km' : 'Brak danych'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{previousMonthStats.fuelCostPerKm > 0 ? formatCurrency(previousMonthStats.fuelCostPerKm) + '/km' : 'Brak danych'}</span>
                  </div>
                </div>
                {monthComparison.fuelCostPerKmChange !== 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {monthComparison.fuelCostPerKmChange > 0 ? 'Większy' : 'Mniejszy'} koszt o {formatCurrency(Math.abs(currentMonthStats.fuelCostPerKm - previousMonthStats.fuelCostPerKm))}/km
                  </p>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Przejechane km</span>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${currentMonthStats.totalKm >= previousMonthStats.totalKm ? 'text-primary' : 'text-muted-foreground'}`}>
                    {currentMonthStats.totalKm >= previousMonthStats.totalKm ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    {previousMonthStats.totalKm > 0 ? Math.abs(((currentMonthStats.totalKm - previousMonthStats.totalKm) / previousMonthStats.totalKm) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Obecny:</span>
                    <span className="font-mono font-semibold">{currentMonthStats.totalKm.toFixed(0)} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Poprzedni:</span>
                    <span className="font-mono">{previousMonthStats.totalKm.toFixed(0)} km</span>
                  </div>
                </div>
                {currentMonthStats.totalKm !== previousMonthStats.totalKm && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {currentMonthStats.totalKm > previousMonthStats.totalKm ? 'Więcej' : 'Mniej'} o {Math.abs(currentMonthStats.totalKm - previousMonthStats.totalKm).toFixed(0)} km
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-2 ${breakEvenAnalysis.isAboveBreakEven ? 'border-success/50 bg-success/5' : 'border-warning/50 bg-warning/10'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Target size={18} weight="duotone" className={breakEvenAnalysis.isAboveBreakEven ? 'text-success' : 'text-warning-foreground'} />
              Próg rentowności
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${breakEvenAnalysis.isAboveBreakEven ? 'text-success' : 'text-warning-foreground'}`}>
              {formatCurrency(breakEvenAnalysis.remainingToBreakEven)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakEvenAnalysis.isAboveBreakEven 
                ? `Powyżej progu o ${formatCurrency(currentMonthStats.revenue - BUSINESS_PLAN_METRICS.breakEvenMonthly)}`
                : `Do progu: ${breakEvenAnalysis.percentageToBreakEven.toFixed(1)}%`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ChartLine size={18} weight="duotone" className="text-primary" />
              Marża zysku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {currentMonthStats.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cel: {BUSINESS_PLAN_METRICS.targetProfitMarginMin}-{BUSINESS_PLAN_METRICS.targetProfitMarginMax}%
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${fuelPriceAnalysis.avgPrice <= BUSINESS_PLAN_METRICS.targetFuelPricePerLiter ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <GasPump size={18} weight="duotone" className={fuelPriceAnalysis.avgPrice <= BUSINESS_PLAN_METRICS.targetFuelPricePerLiter ? 'text-success' : 'text-destructive'} />
              Śr. cena paliwa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${fuelPriceAnalysis.avgPrice <= BUSINESS_PLAN_METRICS.targetFuelPricePerLiter ? 'text-success' : 'text-destructive'}`}>
              {fuelPriceAnalysis.avgPrice.toFixed(2)} PLN/L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cel: {BUSINESS_PLAN_METRICS.targetFuelPricePerLiter.toFixed(2)} PLN/L
              {fuelPriceAnalysis.avgPrice > BUSINESS_PLAN_METRICS.targetFuelPricePerLiter && (
                <span className="text-destructive ml-1">
                  (+{(fuelPriceAnalysis.avgPrice - BUSINESS_PLAN_METRICS.targetFuelPricePerLiter).toFixed(2)})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CurrencyCircleDollar size={18} weight="duotone" className="text-accent-foreground" />
              Miesiąc bieżący
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-accent-foreground">
              {formatCurrency(currentMonthStats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zysk: {formatCurrency(currentMonthStats.profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {currentMonthStats.revenue < BUSINESS_PLAN_METRICS.breakEvenMonthly && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Warning size={24} weight="duotone" className="text-warning-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning-foreground mb-1">Uwaga: Poniżej progu rentowności</p>
                <p className="text-sm text-muted-foreground">
                  Potrzebujesz jeszcze <strong className="text-warning-foreground">{formatCurrency(breakEvenAnalysis.remainingToBreakEven)}</strong> przychodu w tym miesiącu, 
                  aby osiągnąć próg rentowności <strong>{formatCurrency(BUSINESS_PLAN_METRICS.breakEvenMonthly)}</strong> zgodnie z biznesplanem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Przychody vs Koszty (miesięcznie)</CardTitle>
            <CardDescription>Porównanie przychodów, kosztów paliwa i zysku netto</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 280)" />
                  <XAxis dataKey="month" tick={{ fill: 'oklch(0.50 0.02 280)' }} />
                  <YAxis tick={{ fill: 'oklch(0.50 0.02 280)' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(1 0 0)', 
                      border: '1px solid oklch(0.85 0.02 280)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="Przychody" fill={COLORS.revenue} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Koszty paliwa" fill={COLORS.fuel} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Zysk netto" fill={COLORS.profit} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Brak danych do wyświetlenia
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Struktura finansowa (bieżący miesiąc)</CardTitle>
            <CardDescription>Podział przychodów na zysk i koszty</CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthStats.revenue > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DIST_COLORS[index % DIST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Brak danych za bieżący miesiąc
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cena paliwa w czasie</CardTitle>
          <CardDescription>Średnia cena za litr vs cel biznesplanu ({BUSINESS_PLAN_METRICS.targetFuelPricePerLiter.toFixed(2)} PLN/L)</CardDescription>
        </CardHeader>
        <CardContent>
          {fuelPriceAnalysis.priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelPriceAnalysis.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 280)" />
                <XAxis dataKey="month" tick={{ fill: 'oklch(0.50 0.02 280)' }} />
                <YAxis 
                  tick={{ fill: 'oklch(0.50 0.02 280)' }}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(1 0 0)', 
                    border: '1px solid oklch(0.85 0.02 280)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value.toFixed(2)} PLN/L`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Cena za litr" 
                  stroke={COLORS.fuel} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.fuel, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Cel" 
                  stroke={COLORS.target} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Brak danych o paliwie
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
