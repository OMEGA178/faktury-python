import { Button } from '@/components/ui/button'
import { FileText } from '@phosphor-icons/react'
import { Invoice, FuelEntry } from '@/lib/types'
import { exportAllDataToPDF } from '@/lib/export'
import { toast } from 'sonner'

interface ExportAllButtonProps {
  invoices: Invoice[]
  fuelEntries: FuelEntry[]
}

export function ExportAllButton({ invoices, fuelEntries }: ExportAllButtonProps) {
  const handleExport = () => {
    try {
      exportAllDataToPDF(invoices, fuelEntries)
      toast.success('Raport wygenerowany', {
        description: 'Pełny raport finansowy został pobrany',
      })
    } catch (error) {
      toast.error('Błąd eksportu', {
        description: 'Nie udało się wygenerować raportu',
      })
    }
  }

  if (invoices.length === 0 && fuelEntries.length === 0) {
    return null
  }

  return (
    <Button onClick={handleExport} variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-all">
      <FileText className="mr-2" size={20} weight="bold" />
      Pełny raport PDF
    </Button>
  )
}
