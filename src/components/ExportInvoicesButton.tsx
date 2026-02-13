import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FilePdf, FileCsv, Download } from '@phosphor-icons/react'
import { Invoice } from '@/lib/types'
import { exportInvoicesToPDF, exportInvoicesToCSV } from '@/lib/export'
import { toast } from 'sonner'

interface ExportInvoicesButtonProps {
  invoices: Invoice[]
  isPaid: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportInvoicesButton({ invoices, isPaid, variant = 'outline', size = 'default' }: ExportInvoicesButtonProps) {
  const handleExportPDF = () => {
    try {
      exportInvoicesToPDF(invoices, isPaid)
      toast.success('Eksport do PDF', {
        description: 'Plik został pobrany pomyślnie',
      })
    } catch (error) {
      toast.error('Błąd eksportu', {
        description: 'Nie udało się wygenerować pliku PDF',
      })
    }
  }

  const handleExportCSV = () => {
    try {
      exportInvoicesToCSV(invoices, isPaid)
      toast.success('Eksport do CSV', {
        description: 'Plik został pobrany pomyślnie',
      })
    } catch (error) {
      toast.error('Błąd eksportu', {
        description: 'Nie udało się wygenerować pliku CSV',
      })
    }
  }

  if (invoices.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="mr-2" size={18} weight="bold" />
          Eksportuj
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
          <FilePdf className="mr-2" size={18} weight="duotone" />
          Eksportuj do PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileCsv className="mr-2" size={18} weight="duotone" />
          Eksportuj do CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
