import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, FuelEntry } from './types'
import { formatCurrency, formatDate, formatNIP } from './utils'

export function exportInvoicesToPDF(invoices: Invoice[], isPaid: boolean) {
  const doc = new jsPDF()
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Gadowski sp. z o.o.', 14, 20)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Raport faktur', 14, 28)
  doc.text(`Status: ${isPaid ? 'Opłacone' : 'Oczekujące'}`, 14, 34)
  doc.text(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`, 14, 40)
  
  const tableData = invoices.map(inv => {
    const row = [
      inv.companyName,
      formatNIP(inv.nip),
      formatCurrency(inv.amount),
      inv.calculatedDistance && inv.calculatedDistance > 0 
        ? `${inv.calculatedDistance} km`
        : '-',
      inv.calculatedDistance && inv.calculatedDistance > 0
        ? formatCurrency(inv.amount / inv.calculatedDistance) + '/km'
        : '-',
      inv.issueDate ? formatDate(inv.issueDate) : '-',
      formatDate(inv.deadline),
    ]
    
    if (isPaid && inv.paidAt) {
      row.push(formatDate(inv.paidAt))
      row.push(inv.paidOnTime ? 'Tak (+10)' : 'Nie (-5)')
    }
    
    return row
  })
  
  const headers = isPaid 
    ? ['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Data wystawienia', 'Termin płatności', 'Data zapłaty', 'Na czas']
    : ['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Data wystawienia', 'Termin płatności']
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 48,
    styles: { 
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [69, 58, 163],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { top: 48 },
  })
  
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalKm = invoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)
  const avgPerKm = totalKm > 0 ? totalAmount / totalKm : 0
  const finalY = (doc as any).lastAutoTable.finalY || 48
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Łącznie: ${formatCurrency(totalAmount)}`, 14, finalY + 10)
  doc.text(`Liczba faktur: ${invoices.length}`, 14, finalY + 16)
  if (totalKm > 0) {
    doc.text(`Łączne kilometry: ${totalKm.toFixed(0)} km`, 14, finalY + 22)
    doc.text(`Średnio za kilometr: ${formatCurrency(avgPerKm)}/km`, 14, finalY + 28)
  }
  
  const fileName = `faktury_${isPaid ? 'oplacone' : 'oczekujace'}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export function exportInvoicesToCSV(invoices: Invoice[], isPaid: boolean) {
  const headers = isPaid
    ? ['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Data wystawienia', 'Termin płatności', 'Data zapłaty', 'Na czas', 'Punkty', 'Opis', 'Telefon', 'Załadunek', 'Rozładunek', 'Dystans (km)']
    : ['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Data wystawienia', 'Termin płatności', 'Opis', 'Telefon', 'Załadunek', 'Rozładunek', 'Dystans (km)']
  
  const rows = invoices.map(inv => {
    const costPerKm = inv.calculatedDistance && inv.calculatedDistance > 0 
      ? (inv.amount / inv.calculatedDistance).toFixed(2)
      : ''
    
    const baseRow = [
      `"${inv.companyName}"`,
      formatNIP(inv.nip),
      inv.amount,
      inv.calculatedDistance || '',
      costPerKm,
      inv.issueDate ? formatDate(inv.issueDate) : '',
      formatDate(inv.deadline),
    ]
    
    if (isPaid && inv.paidAt) {
      baseRow.push(
        formatDate(inv.paidAt),
        inv.paidOnTime ? 'Tak' : 'Nie',
        inv.paidOnTime ? '10' : '-5',
      )
    }
    
    baseRow.push(
      inv.description ? `"${inv.description}"` : '',
      inv.contactPhone || '',
      inv.loadingLocation ? `"${inv.loadingLocation.city}, ${inv.loadingLocation.address}"` : '',
      inv.unloadingLocation ? `"${inv.unloadingLocation.city}, ${inv.unloadingLocation.address}"` : '',
      inv.calculatedDistance?.toString() || '',
    )
    
    return baseRow
  })
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `faktury_${isPaid ? 'oplacone' : 'oczekujace'}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportFuelToPDF(fuelEntries: FuelEntry[]) {
  const doc = new jsPDF()
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Gadowski sp. z o.o.', 14, 20)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Raport tankowań', 14, 28)
  doc.text(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`, 14, 34)
  
  const sortedEntries = [...fuelEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  const tableData = sortedEntries.map(fuel => [
    formatDate(fuel.date),
    fuel.liters.toFixed(2) + ' L',
    formatCurrency(fuel.pricePerLiter),
    formatCurrency(fuel.amount),
  ])
  
  autoTable(doc, {
    head: [['Data', 'Litry', 'Cena za litr', 'Kwota']],
    body: tableData,
    startY: 42,
    styles: { 
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { top: 42 },
  })
  
  const totalAmount = fuelEntries.reduce((sum, fuel) => sum + fuel.amount, 0)
  const totalLiters = fuelEntries.reduce((sum, fuel) => sum + fuel.liters, 0)
  const avgPrice = totalLiters > 0 ? totalAmount / totalLiters : 0
  const finalY = (doc as any).lastAutoTable.finalY || 42
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Łączna ilość paliwa: ${totalLiters.toFixed(2)} L`, 14, finalY + 10)
  doc.text(`Łączny koszt: ${formatCurrency(totalAmount)}`, 14, finalY + 16)
  doc.text(`Średnia cena: ${formatCurrency(avgPrice)}/L`, 14, finalY + 22)
  doc.text(`Liczba tankowań: ${fuelEntries.length}`, 14, finalY + 28)
  
  const fileName = `tankowania_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export function exportFuelToCSV(fuelEntries: FuelEntry[]) {
  const headers = ['Data', 'Litry', 'Cena za litr (PLN)', 'Kwota (PLN)']
  
  const sortedEntries = [...fuelEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  const rows = sortedEntries.map(fuel => [
    formatDate(fuel.date),
    fuel.liters.toFixed(2),
    fuel.pricePerLiter.toFixed(2),
    fuel.amount.toFixed(2),
  ])
  
  const totalAmount = fuelEntries.reduce((sum, fuel) => sum + fuel.amount, 0)
  const totalLiters = fuelEntries.reduce((sum, fuel) => sum + fuel.liters, 0)
  const avgPrice = totalLiters > 0 ? totalAmount / totalLiters : 0
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const summaryContent = `\n\nPodsumowanie:
Łączna ilość paliwa,${totalLiters.toFixed(2)} L
Łączny koszt,${totalAmount.toFixed(2)} PLN
Średnia cena,${avgPrice.toFixed(2)} PLN/L
Liczba tankowań,${fuelEntries.length}`
  
  const fullContent = csvContent + summaryContent
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + fullContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `tankowania_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportAllDataToPDF(invoices: Invoice[], fuelEntries: FuelEntry[]) {
  const doc = new jsPDF()
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Gadowski sp. z o.o.', 14, 20)
  
  doc.setFontSize(14)
  doc.text('Pełny raport finansowy', 14, 30)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`, 14, 38)
  
  const outstandingInvoices = invoices.filter(inv => !inv.isPaid)
  const paidInvoices = invoices.filter(inv => inv.isPaid)
  
  const totalEarned = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalFuel = fuelEntries.reduce((sum, fuel) => sum + fuel.amount, 0)
  const netProfit = totalEarned - totalFuel
  const totalKm = paidInvoices.reduce((sum, inv) => sum + (inv.calculatedDistance || 0), 0)
  const avgPerKm = totalKm > 0 ? totalEarned / totalKm : 0
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Podsumowanie finansowe:', 14, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Zarobione (opłacone faktury): ${formatCurrency(totalEarned)}`, 20, 58)
  doc.text(`Oczekujące płatności: ${formatCurrency(totalPending)}`, 20, 64)
  doc.text(`Wydatki na paliwo: ${formatCurrency(totalFuel)}`, 20, 70)
  doc.setFont('helvetica', 'bold')
  doc.text(`Zysk netto: ${formatCurrency(netProfit)}`, 20, 76)
  doc.setFont('helvetica', 'normal')
  if (totalKm > 0) {
    doc.text(`Przejechane km: ${totalKm.toFixed(0)} km`, 20, 82)
    doc.text(`Średnio za km: ${formatCurrency(avgPerKm)}/km`, 20, 88)
  }
  
  let currentY = totalKm > 0 ? 98 : 88
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Oczekujące faktury:', 14, currentY)
  
  if (outstandingInvoices.length > 0) {
    const outstandingData = outstandingInvoices.map(inv => [
      inv.companyName,
      formatNIP(inv.nip),
      formatCurrency(inv.amount),
      inv.calculatedDistance && inv.calculatedDistance > 0 
        ? `${inv.calculatedDistance} km`
        : '-',
      inv.calculatedDistance && inv.calculatedDistance > 0
        ? formatCurrency(inv.amount / inv.calculatedDistance) + '/km'
        : '-',
      formatDate(inv.deadline),
    ])
    
    autoTable(doc, {
      head: [['Firma', 'NIP', 'Kwota', 'km', 'PLN/km', 'Termin']],
      body: outstandingData,
      startY: currentY + 5,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [239, 68, 68], fontStyle: 'bold' },
      columnStyles: { 
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Brak oczekujących faktur', 20, currentY + 8)
    currentY += 18
  }
  
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Opłacone faktury:', 14, currentY)
  
  if (paidInvoices.length > 0) {
    const paidData = paidInvoices.slice(0, 10).map(inv => [
      inv.companyName,
      formatCurrency(inv.amount),
      inv.calculatedDistance && inv.calculatedDistance > 0 
        ? `${inv.calculatedDistance} km`
        : '-',
      inv.calculatedDistance && inv.calculatedDistance > 0
        ? formatCurrency(inv.amount / inv.calculatedDistance) + '/km'
        : '-',
      inv.paidAt ? formatDate(inv.paidAt) : '-',
      inv.paidOnTime ? 'Tak' : 'Nie',
    ])
    
    autoTable(doc, {
      head: [['Firma', 'Kwota', 'km', 'PLN/km', 'Data zapłaty', 'Na czas']],
      body: paidData,
      startY: currentY + 5,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
      columnStyles: { 
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 10
    
    if (paidInvoices.length > 10) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.text(`(Pokazano 10 z ${paidInvoices.length} faktur)`, 14, currentY)
      currentY += 8
    }
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Brak opłaconych faktur', 20, currentY + 8)
    currentY += 18
  }
  
  if (currentY > 220) {
    doc.addPage()
    currentY = 20
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Tankowania (ostatnie 10):', 14, currentY)
  
  if (fuelEntries.length > 0) {
    const sortedFuel = [...fuelEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
    
    const fuelData = sortedFuel.map(fuel => [
      formatDate(fuel.date),
      fuel.liters.toFixed(2) + ' L',
      formatCurrency(fuel.pricePerLiter),
      formatCurrency(fuel.amount),
    ])
    
    autoTable(doc, {
      head: [['Data', 'Litry', 'Cena/L', 'Kwota']],
      body: fuelData,
      startY: currentY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [239, 68, 68], fontStyle: 'bold' },
      columnStyles: { 
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    })
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Brak danych o tankowaniach', 20, currentY + 8)
  }
  
  const fileName = `raport_pelny_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
