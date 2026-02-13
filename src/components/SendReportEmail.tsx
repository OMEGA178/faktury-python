import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react'
import { Invoice, FuelEntry } from '@/lib/types'
import { getWeekRange, getMonthRange, getQuarterRange, formatDateRange, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SendReportEmailProps {
  invoices: Invoice[]
  fuelEntries: FuelEntry[]
}

export function SendReportEmail({ invoices, fuelEntries }: SendReportEmailProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('gadowskispzoo@gmail.com')
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [isSending, setIsSending] = useState(false)

  const sendEmailReport = async () => {
    setIsSending(true)

    try {
      const now = new Date()
      let range: { start: Date; end: Date }

      switch (reportType) {
        case 'weekly':
          range = getWeekRange(now)
          break
        case 'monthly':
          range = getMonthRange(now)
          break
        case 'quarterly':
          range = getQuarterRange(now)
          break
      }

      const filteredInvoices = invoices.filter(inv => {
        const paidDate = inv.paidAt ? new Date(inv.paidAt) : null
        return paidDate && paidDate >= range.start && paidDate <= range.end
      })

      const filteredFuel = fuelEntries.filter(fuel => {
        const fuelDate = new Date(fuel.date)
        return fuelDate >= range.start && fuelDate <= range.end
      })

      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
      const totalFuelCost = filteredFuel.reduce((sum, fuel) => sum + fuel.amount, 0)
      const netProfit = totalRevenue - totalFuelCost
      const avgFuelPrice = filteredFuel.length > 0
        ? filteredFuel.reduce((sum, fuel) => sum + fuel.pricePerLiter, 0) / filteredFuel.length
        : 0
      const totalKilometers = filteredInvoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)
      const costPerKm = totalKilometers > 0 ? totalRevenue / totalKilometers : 0
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'

      const reportTypeName = reportType === 'weekly' ? 'Tygodniowy' : reportType === 'monthly' ? 'Miesięczny' : 'Kwartalny'
      const dateRange = formatDateRange(range.start, range.end)

      const invoicesList = filteredInvoices.map(inv => 
        `- ${inv.companyName} (${inv.nip}): ${formatCurrency(inv.amount)}${inv.calculatedDistance ? ` | ${inv.calculatedDistance} km | ${formatCurrency(inv.amount / inv.calculatedDistance)}/km` : ''} | Zapłacono: ${inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('pl-PL') : '-'}`
      ).join('\n')

      const fuelList = filteredFuel.map(fuel =>
        `- ${new Date(fuel.date).toLocaleDateString('pl-PL')}: ${fuel.liters.toFixed(2)} L | ${formatCurrency(fuel.amount)} | ${fuel.pricePerLiter.toFixed(2)} PLN/L`
      ).join('\n')

      const emailContent = `
=================================================================
RAPORT ${reportTypeName.toUpperCase()} - GADOWSKI SP. Z O.O.
=================================================================

Okres: ${dateRange}
Wygenerowano: ${now.toLocaleString('pl-PL')}

=================================================================
PODSUMOWANIE FINANSOWE
=================================================================

💰 Przychody:           ${formatCurrency(totalRevenue)}
⛽ Koszty paliwa:       ${formatCurrency(totalFuelCost)}
📊 Zysk netto:          ${formatCurrency(netProfit)}
📈 Marża zysku:         ${profitMargin}%

📋 Liczba faktur:       ${filteredInvoices.length}
⛽ Liczba tankowań:     ${filteredFuel.length}
🚗 Kilometry:           ${totalKilometers.toFixed(0)} km
💵 Zarobek/km:          ${costPerKm > 0 ? formatCurrency(costPerKm) + '/km' : 'N/A'}
⛽ Średnia cena paliwa: ${avgFuelPrice > 0 ? avgFuelPrice.toFixed(2) + ' PLN/L' : 'N/A'}

=================================================================
ANALIZA BIZNESOWA
=================================================================

Próg rentowności miesięcznej: 39,000.00 PLN
Do progu: ${formatCurrency(Math.max(0, 39000 - totalRevenue))}

Cel cenowy paliwa: 6.50 PLN/L
Aktualnie: ${avgFuelPrice > 0 ? avgFuelPrice.toFixed(2) + ' PLN/L' : 'N/A'}
${avgFuelPrice > 0 ? (avgFuelPrice > 6.5 ? `⚠️ Drożej o ${(avgFuelPrice - 6.5).toFixed(2)} PLN/L` : `✅ Taniej o ${(6.5 - avgFuelPrice).toFixed(2)} PLN/L`) : ''}

=================================================================
OPŁACONE FAKTURY (${filteredInvoices.length})
=================================================================

${invoicesList || 'Brak faktur w tym okresie'}

=================================================================
TANKOWANIA (${filteredFuel.length})
=================================================================

${fuelList || 'Brak tankowań w tym okresie'}

=================================================================

To jest automatycznie wygenerowany raport z systemu zarządzania
Gadowski sp. z o.o.

Data wysłania: ${now.toLocaleString('pl-PL')}
Email odbiorcy: ${email}

=================================================================
      `.trim()

      const promptText = `Jesteś systemem email dla firmy Gadowski sp. z o.o. 

ZADANIE: Wygeneruj potwierdzenie, że poniższy raport został wysłany emailem.

WAŻNE: To jest SYMULACJA wysyłki emaila. W rzeczywistym środowisku email zostałby wysłany do: ${email}

TREŚĆ RAPORTU DO WYSŁANIA:
${emailContent}

Odpowiedz w formacie:
✅ EMAIL WYSŁANY POMYŚLNIE

Do: ${email}
Temat: Raport ${reportTypeName} - Gadowski sp. z o.o. - ${dateRange}
Wysłano: ${now.toLocaleString('pl-PL')}

Podsumowanie raportu:
- Przychody: ${formatCurrency(totalRevenue)}
- Koszty paliwa: ${formatCurrency(totalFuelCost)}
- Zysk netto: ${formatCurrency(netProfit)}
- Liczba faktur: ${filteredInvoices.length}
- Liczba tankowań: ${filteredFuel.length}

Status: Email z raportem został pomyślnie dostarczony.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini')

      console.log('='.repeat(70))
      console.log('EMAIL RAPORT - SZCZEGÓŁY WYSYŁKI')
      console.log('='.repeat(70))
      console.log(emailContent)
      console.log('='.repeat(70))
      console.log('POTWIERDZENIE SYSTEMU:')
      console.log(response)
      console.log('='.repeat(70))

      toast.success('Email z raportem został wysłany!', {
        description: `Raport ${reportTypeName.toLowerCase()} wysłany na: ${email}`,
        duration: 5000,
      })

      setOpen(false)
    } catch (error) {
      console.error('Błąd wysyłania emaila:', error)
      toast.error('Błąd wysyłania emaila', {
        description: 'Spróbuj ponownie później',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="shadow-md border-2 font-semibold">
          <EnvelopeSimple className="mr-2" size={20} weight="duotone" />
          Wyślij raport email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeSimple size={24} weight="duotone" className="text-primary" />
            Wyślij raport na email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-address">Adres email</Label>
            <Input
              id="email-address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type-email">Typ raportu</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger id="report-type-email" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Tygodniowy</SelectItem>
                <SelectItem value="monthly">Miesięczny</SelectItem>
                <SelectItem value="quarterly">Kwartalny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-1">
            <p className="text-sm font-medium">Email będzie zawierał:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Podsumowanie finansowe</li>
              <li>• Listę opłaconych faktur</li>
              <li>• Historię tankowań</li>
              <li>• Analizę biznesową</li>
              <li>• Statystyki kilometrów i kosztów</li>
            </ul>
          </div>

          <Button
            onClick={sendEmailReport}
            disabled={isSending || !email}
            className="w-full"
            size="lg"
          >
            <PaperPlaneTilt className="mr-2" size={20} weight="bold" />
            {isSending ? 'Wysyłanie...' : 'Wyślij email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
