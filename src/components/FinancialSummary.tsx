import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendUp, TrendDown, Wallet, GasPump, CurrencyCircleDollar } from '@phosphor-icons/react'
import { Invoice, FuelEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface FinancialSummaryProps {
  invoices: Invoice[]
  fuelEntries: FuelEntry[]
}

function calculateFuelCostForInvoice(invoice: Invoice, fuelEntries: FuelEntry[]): number {
  if (!invoice.issueDate) return 0
  
  const issueDate = new Date(invoice.issueDate)
  const deadlineDate = new Date(invoice.deadline)
  
  return fuelEntries
    .filter(fuel => {
      const fuelDate = new Date(fuel.date)
      return fuelDate >= issueDate && fuelDate <= deadlineDate
    })
    .reduce((sum, fuel) => sum + fuel.amount, 0)
}

export function FinancialSummary({ invoices, fuelEntries }: FinancialSummaryProps) {
  const totalEarned = invoices
    .filter(inv => inv.isPaid)
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalOutstanding = invoices
    .filter(inv => !inv.isPaid)
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalFuelExpense = fuelEntries.reduce((sum, entry) => sum + entry.amount, 0)

  const totalLiters = fuelEntries.reduce((sum, entry) => sum + entry.liters, 0)

  const netProfit = totalEarned - totalFuelExpense
  
  const invoicesWithFuel = invoices
    .filter(inv => inv.isPaid && inv.issueDate)
    .map(inv => ({
      ...inv,
      fuelCost: calculateFuelCostForInvoice(inv, fuelEntries),
      netAmount: inv.amount - calculateFuelCostForInvoice(inv, fuelEntries)
    }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <TrendUp size={18} weight="duotone" className="text-success" />
              Zarobione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              {formatCurrency(totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(inv => inv.isPaid).length} opłaconych faktur
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Wallet size={18} weight="duotone" className="text-warning-foreground" />
              Oczekujące
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning-foreground">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(inv => !inv.isPaid).length} faktur do zapłaty
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <GasPump size={18} weight="duotone" className="text-destructive" />
              Wydane na paliwo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              {formatCurrency(totalFuelExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalLiters.toFixed(2)} L • {fuelEntries.length} tankowań
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${netProfit >= 0 ? 'border-primary/50 bg-primary/5' : 'border-destructive/50 bg-destructive/5'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CurrencyCircleDollar size={18} weight="duotone" className={netProfit >= 0 ? 'text-primary' : 'text-destructive'} />
              Bilans (zarobione - paliwo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono flex items-center gap-2 ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {netProfit >= 0 ? <TrendUp size={24} weight="bold" /> : <TrendDown size={24} weight="bold" />}
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netProfit >= 0 ? 'Na plus' : 'Strata'} na ten moment
            </p>
          </CardContent>
        </Card>
      </div>

      {invoicesWithFuel.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Szczegóły przychodów z odliczonym paliwem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {invoicesWithFuel.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{inv.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.issueDate ? `Wystawiona: ${new Date(inv.issueDate).toLocaleDateString('pl-PL')}` : ''}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-mono text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                    {inv.fuelCost > 0 && (
                      <>
                        <p className="font-mono text-xs text-destructive">- {formatCurrency(inv.fuelCost)} (paliwo)</p>
                        <p className="font-mono text-sm font-bold text-success">= {formatCurrency(inv.netAmount)}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
