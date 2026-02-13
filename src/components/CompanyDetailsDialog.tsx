import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Buildings, TrendUp, CheckCircle, Clock, Warning, Image, Package } from '@phosphor-icons/react'
import { Company } from '@/lib/types'
import { formatCurrency, formatDate, formatNIP, getScoreLevel } from '@/lib/utils'
import { ImagePreviewDialog } from './ImagePreviewDialog'
import { useState } from 'react'

interface CompanyDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
}

export function CompanyDetailsDialog({ open, onOpenChange, company }: CompanyDetailsDialogProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewTitle, setPreviewTitle] = useState('')

  if (!company) return null

  const handleImageClick = (images: string[], title: string) => {
    setPreviewImages(images)
    setPreviewTitle(title)
    setImagePreviewOpen(true)
  }

  const scoreLevel = getScoreLevel(company.score)
  const paidInvoices = company.invoices.filter(inv => inv.isPaid)
  const outstandingInvoices = company.invoices.filter(inv => !inv.isPaid)
  const onTimePayments = paidInvoices.filter(inv => inv.paidOnTime).length
  const latePayments = paidInvoices.filter(inv => !inv.paidOnTime).length
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  const scoreBadgeColors = {
    excellent: 'bg-success/10 text-success border-success/30',
    good: 'bg-success/10 text-success border-success/40',
    fair: 'bg-warning/10 text-warning-foreground border-warning/40',
    poor: 'bg-destructive/10 text-destructive border-destructive/30',
  }

  const scoreLabelTexts = {
    excellent: 'Doskonały',
    good: 'Dobry',
    fair: 'Średni',
    poor: 'Słaby',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Buildings size={32} weight="duotone" className="text-primary" />
            {company.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono pt-1">
            NIP: {formatNIP(company.nip)}
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendUp size={24} weight="bold" className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Punktacja</p>
                <p className="text-3xl font-bold font-mono">{company.score}</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-base px-4 py-1 ${scoreBadgeColors[scoreLevel]}`}>
              {scoreLabelTexts[scoreLevel]}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Faktur ogółem</p>
              <p className="text-2xl font-bold">{company.invoices.length}</p>
            </div>
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">Opłacone</p>
              <p className="text-2xl font-bold text-success">{paidInvoices.length}</p>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
              <p className="text-sm text-muted-foreground mb-1">Oczekujące</p>
              <p className="text-2xl font-bold text-warning-foreground">{outstandingInvoices.length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Razem do zapłaty</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>

          {paidInvoices.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" className="text-success" />
                  Na czas
                </p>
                <p className="text-xl font-bold">{onTimePayments} faktur</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Warning size={14} weight="fill" className="text-warning-foreground" />
                  Po terminie
                </p>
                <p className="text-xl font-bold">{latePayments} faktur</p>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Historia płatności</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data utworzenia</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Termin płatności</TableHead>
                    <TableHead>Data ostateczna</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data płatności</TableHead>
                    <TableHead>Załączniki</TableHead>
                    <TableHead className="text-right">Punkty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Brak faktur dla tej firmy
                      </TableCell>
                    </TableRow>
                  ) : (
                    company.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {invoice.paymentTerm === 0 ? 'Gotówka' : `${invoice.paymentTerm} dni`}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDate(invoice.deadline)}
                        </TableCell>
                        <TableCell>
                          {invoice.isPaid ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              <CheckCircle className="mr-1" size={12} weight="fill" />
                              Opłacone
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/40">
                              <Clock className="mr-1" size={12} weight="fill" />
                              Oczekuje
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {invoice.paidAt ? (
                            <span className={invoice.paidOnTime ? 'text-success' : 'text-warning-foreground'}>
                              {formatDate(invoice.paidAt)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {invoice.invoiceImages && invoice.invoiceImages.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleImageClick(invoice.invoiceImages!, 'Zdjęcia faktury')}
                              >
                                <Image size={14} weight="duotone" />
                                <span className="ml-1 text-xs">{invoice.invoiceImages.length}</span>
                              </Button>
                            )}
                            {invoice.cargoImages && invoice.cargoImages.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleImageClick(invoice.cargoImages!, 'Zdjęcia ładunku')}
                              >
                                <Package size={14} weight="duotone" />
                                <span className="ml-1 text-xs">{invoice.cargoImages.length}</span>
                              </Button>
                            )}
                            {!invoice.invoiceImages && !invoice.cargoImages && (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {invoice.isPaid ? (
                            <span className={invoice.paidOnTime ? 'text-success' : 'text-destructive'}>
                              {invoice.paidOnTime ? '+10' : '-5'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPaid > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Suma opłaconych faktur</p>
              <p className="text-2xl font-bold font-mono text-primary">{formatCurrency(totalPaid)}</p>
            </div>
          )}
        </div>

        <ImagePreviewDialog
          open={imagePreviewOpen}
          onOpenChange={setImagePreviewOpen}
          images={previewImages}
          title={previewTitle}
        />
      </DialogContent>
    </Dialog>
  )
}
