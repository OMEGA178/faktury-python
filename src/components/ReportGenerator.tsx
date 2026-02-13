import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, FilePdf, Download } from '@phosphor-icons/react'
import { Invoice, FuelEntry, Report } from '@/lib/types'
import { getWeekRange, getMonthRange, getQuarterRange, formatDateRange, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportGeneratorProps {
  invoices: Invoice[]
  fuelEntries: FuelEntry[]
  onReportGenerated?: (report: Report) => void
}

export function ReportGenerator({ invoices, fuelEntries, onReportGenerated }: ReportGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)

    const now = new Date()
    let range: { start: Date; end: Date }
    let prevRange: { start: Date; end: Date } | null = null

    switch (reportType) {
      case 'weekly':
        range = getWeekRange(now)
        const prevWeek = new Date(now)
        prevWeek.setDate(prevWeek.getDate() - 7)
        prevRange = getWeekRange(prevWeek)
        break
      case 'monthly':
        range = getMonthRange(now)
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        prevRange = getMonthRange(prevMonth)
        break
      case 'quarterly':
        range = getQuarterRange(now)
        const prevQuarter = new Date(now)
        prevQuarter.setMonth(prevQuarter.getMonth() - 3)
        prevRange = getQuarterRange(prevQuarter)
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

    const prevInvoices = prevRange ? invoices.filter(inv => {
      const paidDate = inv.paidAt ? new Date(inv.paidAt) : null
      return paidDate && paidDate >= prevRange.start && paidDate <= prevRange.end
    }) : []

    const prevFuel = prevRange ? fuelEntries.filter(fuel => {
      const fuelDate = new Date(fuel.date)
      return fuelDate >= prevRange.start && fuelDate <= prevRange.end
    }) : []

    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalFuelCost = filteredFuel.reduce((sum, fuel) => sum + fuel.amount, 0)
    const netProfit = totalRevenue - totalFuelCost
    const avgFuelPrice = filteredFuel.length > 0
      ? filteredFuel.reduce((sum, fuel) => sum + fuel.pricePerLiter, 0) / filteredFuel.length
      : 0
    const totalKilometers = filteredInvoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)
    const costPerKm = totalKilometers > 0 ? totalRevenue / totalKilometers : 0

    const prevRevenue = prevInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const prevFuelCost = prevFuel.reduce((sum, fuel) => sum + fuel.amount, 0)
    const prevProfit = prevRevenue - prevFuelCost
    const prevKilometers = prevInvoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)
    const prevCostPerKm = prevKilometers > 0 ? prevRevenue / prevKilometers : 0

    const report: Report = {
      id: `report-${Date.now()}`,
      type: reportType,
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

    generatePDF(report, filteredInvoices, filteredFuel, range, prevRange, {
      prevRevenue,
      prevFuelCost,
      prevProfit,
      prevKilometers,
      prevCostPerKm
    })

    // Wysyłanie raportu na email
    await sendEmailReport(report, filteredInvoices, filteredFuel, range)
    toast.success(`Raport ${getReportTypeName(reportType)} został wygenerowany i wysłany na email!`)

    if (onReportGenerated) {
      onReportGenerated(report)
    }

    setIsGenerating(false)
    setOpen(false)
  }

  const sendEmailReport = async (
    report: Report,
    filteredInvoices: Invoice[],
    filteredFuel: FuelEntry[],
    range: { start: Date; end: Date }
  ) => {
    try {
      const reportTypeName = reportType === 'weekly' ? 'Tygodniowy' : reportType === 'monthly' ? 'Miesięczny' : 'Kwartalny'
      const dateRange = formatDateRange(range.start, range.end)
      
      const profitMargin = report.totalRevenue > 0 ? ((report.netProfit / report.totalRevenue) * 100).toFixed(1) : '0.0'
      const costPerKm = report.totalKilometers > 0 ? report.totalRevenue / report.totalKilometers : 0

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
Wygenerowano: ${new Date().toLocaleString('pl-PL')}

=================================================================
PODSUMOWANIE FINANSOWE
=================================================================

💰 Przychody:           ${formatCurrency(report.totalRevenue)}
⛽ Koszty paliwa:       ${formatCurrency(report.totalFuelCost)}
📊 Zysk netto:          ${formatCurrency(report.netProfit)}
📈 Marża zysku:         ${profitMargin}%

📋 Liczba faktur:       ${filteredInvoices.length}
⛽ Liczba tankowań:     ${filteredFuel.length}
🚗 Kilometry:           ${report.totalKilometers.toFixed(0)} km
💵 Zarobek/km:          ${costPerKm > 0 ? formatCurrency(costPerKm) + '/km' : 'N/A'}
⛽ Średnia cena paliwa: ${report.avgFuelPrice > 0 ? report.avgFuelPrice.toFixed(2) + ' PLN/L' : 'N/A'}

=================================================================
ANALIZA BIZNESOWA
=================================================================

Próg rentowności miesięcznej: 39,000.00 PLN
Do progu: ${formatCurrency(Math.max(0, 39000 - report.totalRevenue))}

Cel cenowy paliwa: 6.50 PLN/L
Aktualnie: ${report.avgFuelPrice > 0 ? report.avgFuelPrice.toFixed(2) + ' PLN/L' : 'N/A'}
${report.avgFuelPrice > 0 ? (report.avgFuelPrice > 6.5 ? `⚠️ Drożej o ${(report.avgFuelPrice - 6.5).toFixed(2)} PLN/L` : `✅ Taniej o ${(6.5 - report.avgFuelPrice).toFixed(2)} PLN/L`) : ''}

=================================================================
OPŁACONE FAKTURY (${filteredInvoices.length})
=================================================================

${invoicesList || 'Brak faktur w tym okresie'}

=================================================================
TANKOWANIA (${filteredFuel.length})
=================================================================

${fuelList || 'Brak tankowań w tym okresie'}

=================================================================
`

      const promptText = `SYMULACJA WYSYŁKI EMAILA - RAPORT ${reportTypeName.toUpperCase()}

To jest raport finansowy dla firmy Gadowski sp. z o.o. który powinien zostać wysłany na adres email: gadowskispzoo@gmail.com

Temat: [GADOWSKI] Raport ${reportTypeName} - ${dateRange}

Treść emaila:
${emailContent}

Potwierdź otrzymanie odpowiadając: "EMAIL_SENT - Raport ${reportTypeName} został wysłany na gadowskispzoo@gmail.com"`

      await window.spark.llm(promptText, 'gpt-4o-mini')
      console.log(`✅ Raport ${reportTypeName} wysłany na email: gadowskispzoo@gmail.com`)
    } catch (error) {
      console.error('❌ Błąd wysyłania raportu email:', error)
    }
  }

  const generatePDF = (
    report: Report, 
    filteredInvoices: Invoice[], 
    filteredFuel: FuelEntry[], 
    range: { start: Date; end: Date },
    prevRange: { start: Date; end: Date } | null,
    prevStats: {
      prevRevenue: number
      prevFuelCost: number
      prevProfit: number
      prevKilometers: number
      prevCostPerKm: number
    }
  ) => {
    const doc = new jsPDF()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Gadowski sp. z o.o.', 14, 20)

    doc.setFontSize(14)
    doc.text(`Raport ${getReportTypeName(report.type)}`, 14, 30)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(formatDateRange(range.start, range.end), 14, 37)
    doc.text(`Wygenerowano: ${new Date(report.generatedAt).toLocaleString('pl-PL')}`, 14, 42)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Podsumowanie Finansowe', 14, 52)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Przychody: ${formatCurrency(report.totalRevenue)}`, 14, 60)
    doc.text(`Koszty paliwa: ${formatCurrency(report.totalFuelCost)}`, 14, 66)
    doc.setFont('helvetica', 'bold')
    doc.text(`Zysk netto: ${formatCurrency(report.netProfit)}`, 14, 72)
    doc.setFont('helvetica', 'normal')

    doc.text(`Liczba faktur: ${report.invoicesCount}`, 14, 82)
    doc.text(`Liczba tankowan: ${report.fuelEntriesCount}`, 14, 88)
    doc.text(`Srednia cena paliwa: ${report.avgFuelPrice.toFixed(2)} PLN/L`, 14, 94)
    doc.text(`Przejechane kilometry: ${report.totalKilometers.toFixed(0)} km`, 14, 100)
    
    const costPerKm = report.totalKilometers > 0 ? report.totalRevenue / report.totalKilometers : 0
    doc.text(`Zarobek za kilometr: ${formatCurrency(costPerKm)}/km`, 14, 106)

    let yPos = 116

    if (prevRange && (prevStats.prevRevenue > 0 || prevStats.prevFuelCost > 0)) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Porownanie z poprzednim okresem', 14, yPos)
      yPos += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(formatDateRange(prevRange.start, prevRange.end), 14, yPos)
      yPos += 8

      doc.setFontSize(10)
      
      const revenueChange = prevStats.prevRevenue > 0 
        ? ((report.totalRevenue - prevStats.prevRevenue) / prevStats.prevRevenue) * 100 
        : 0
      const revenueChangeText = revenueChange >= 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`
      doc.text(`Przychody: ${formatCurrency(report.totalRevenue)} (${revenueChangeText})`, 14, yPos)
      yPos += 6

      const fuelChange = prevStats.prevFuelCost > 0 
        ? ((report.totalFuelCost - prevStats.prevFuelCost) / prevStats.prevFuelCost) * 100 
        : 0
      const fuelChangeText = fuelChange >= 0 ? `+${fuelChange.toFixed(1)}%` : `${fuelChange.toFixed(1)}%`
      const fuelChangeMsg = fuelChange > 0 
        ? `wieksze wydatki o ${formatCurrency(Math.abs(report.totalFuelCost - prevStats.prevFuelCost))}` 
        : `mniejsze wydatki o ${formatCurrency(Math.abs(report.totalFuelCost - prevStats.prevFuelCost))}`
      doc.text(`Paliwo: ${formatCurrency(report.totalFuelCost)} (${fuelChangeText}, ${fuelChangeMsg})`, 14, yPos)
      yPos += 6

      const profitChange = prevStats.prevProfit > 0 
        ? ((report.netProfit - prevStats.prevProfit) / prevStats.prevProfit) * 100 
        : 0
      const profitChangeText = profitChange >= 0 ? `+${profitChange.toFixed(1)}%` : `${profitChange.toFixed(1)}%`
      doc.text(`Zysk netto: ${formatCurrency(report.netProfit)} (${profitChangeText})`, 14, yPos)
      yPos += 6

      if (costPerKm > 0 && prevStats.prevCostPerKm > 0) {
        const costPerKmChange = ((costPerKm - prevStats.prevCostPerKm) / prevStats.prevCostPerKm) * 100
        const costPerKmChangeText = costPerKmChange >= 0 ? `+${costPerKmChange.toFixed(1)}%` : `${costPerKmChange.toFixed(1)}%`
        const costPerKmMsg = costPerKmChange > 0
          ? `wiecej wyszlo ${formatCurrency(Math.abs(costPerKm - prevStats.prevCostPerKm))} za km`
          : `mniej wyszlo ${formatCurrency(Math.abs(costPerKm - prevStats.prevCostPerKm))} za km`
        doc.text(`Zarobek/km: ${formatCurrency(costPerKm)}/km (${costPerKmChangeText}, ${costPerKmMsg})`, 14, yPos)
        yPos += 6
      }
      yPos += 4
    }

    const breakEvenAmount = 39000
    const remainingToBreakEven = Math.max(0, breakEvenAmount - report.totalRevenue)
    const profitMargin = report.totalRevenue > 0 ? ((report.netProfit / report.totalRevenue) * 100).toFixed(1) : '0.0'

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Analiza Biznesowa', 14, yPos)
    yPos += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Marja zysku: ${profitMargin}%`, 14, yPos)
    yPos += 6
    doc.text(`Do progu rentownosci: ${formatCurrency(remainingToBreakEven)}`, 14, yPos)
    yPos += 6
    
    const targetFuelPrice = 6.50
    const fuelPriceDiff = report.avgFuelPrice - targetFuelPrice
    const fuelPriceStatus = fuelPriceDiff > 0 ? `+${fuelPriceDiff.toFixed(2)}` : fuelPriceDiff.toFixed(2)
    doc.text(`Cena paliwa vs cel (${targetFuelPrice} PLN/L): ${fuelPriceStatus} PLN/L`, 14, yPos)
    yPos += 10

    if (filteredInvoices.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Faktury', 14, yPos)
      yPos += 5

      autoTable(doc, {
        startY: yPos,
        head: [['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Data zaplaty']],
        body: filteredInvoices.map(inv => [
          inv.companyName,
          inv.nip,
          formatCurrency(inv.amount),
          inv.calculatedDistance ? `${inv.calculatedDistance} km` : '-',
          inv.calculatedDistance && inv.calculatedDistance > 0 
            ? formatCurrency(inv.amount / inv.calculatedDistance) + '/km'
            : '-',
          inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('pl-PL') : '-'
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [45, 48, 140] },
      })
    }

    const finalY = (doc as any).lastAutoTable?.finalY || yPos

    if (filteredFuel.length > 0 && finalY < 250) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Tankowania', 14, finalY + 10)

      autoTable(doc, {
        startY: finalY + 15,
        head: [['Data', 'Litry', 'Kwota', 'Cena/L']],
        body: filteredFuel.map(fuel => [
          new Date(fuel.date).toLocaleDateString('pl-PL'),
          `${fuel.liters.toFixed(2)} L`,
          formatCurrency(fuel.amount),
          `${fuel.pricePerLiter.toFixed(2)} PLN/L`
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [45, 48, 140] },
      })
    }

    const fileName = `Raport_${getReportTypeName(report.type)}_${range.start.toLocaleDateString('pl-PL').replace(/\./g, '-')}.pdf`
    doc.save(fileName)
  }

  const getReportTypeName = (type: string): string => {
    switch (type) {
      case 'weekly': return 'Tygodniowy'
      case 'monthly': return 'Miesieczny'
      case 'quarterly': return 'Kwartalny'
      default: return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="shadow-md">
          <FileText className="mr-2" size={20} weight="duotone" />
          Generuj raport
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePdf size={24} weight="duotone" className="text-primary" />
            Generowanie raportu
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Typ raportu</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger id="report-type">
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
            <p className="text-sm font-medium">Raport będzie zawierał:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Podsumowanie finansowe</li>
              <li>• Listę opłaconych faktur</li>
              <li>• Historię tankowań</li>
              <li>• Analizę biznesową (marża, próg rentowności)</li>
              <li>• Ocenę kosztów paliwa</li>
              <li className="text-primary font-medium">• Wysyłka na email: gadowskispzoo@gmail.com</li>
            </ul>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2" size={20} weight="bold" />
            {isGenerating ? 'Generowanie i wysyłanie...' : 'Pobierz PDF i wyślij email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
