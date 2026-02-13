import { useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Warning } from '@phosphor-icons/react'
import { Invoice } from '@/lib/types'
import { formatCurrency, formatNIP } from '@/lib/utils'

interface PaymentConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onConfirm: () => void
}

export function PaymentConfirmationDialog({ open, onOpenChange, invoice, onConfirm }: PaymentConfirmationDialogProps) {
  const [stage, setStage] = useState(1)

  const handleClose = () => {
    setStage(1)
    onOpenChange(false)
  }

  const handleNext = () => {
    if (stage < 3) {
      setStage(stage + 1)
    } else {
      onConfirm()
      handleClose()
    }
  }

  if (!invoice) return null

  const progress = (stage / 3) * 100

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Warning size={24} weight="fill" className="text-accent" />
            Potwierdzenie płatności - Etap {stage}/3
          </AlertDialogTitle>
          <div className="pt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          {stage === 1 && (
            <div className="space-y-3">
              <AlertDialogDescription className="text-base">
                Czy na pewno chcesz oznaczyć tę fakturę jako opłaconą?
              </AlertDialogDescription>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Firma:</span>
                  <span className="text-sm">{invoice.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">NIP:</span>
                  <span className="text-sm font-mono">{formatNIP(invoice.nip)}</span>
                </div>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div className="space-y-3">
              <AlertDialogDescription className="text-base">
                Sprawdź dokładnie kwotę przed potwierdzeniem:
              </AlertDialogDescription>
              <div className="bg-accent/10 border-2 border-accent/40 p-6 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Kwota do zapłaty</div>
                <div className="text-3xl font-bold font-mono text-accent-foreground">
                  {formatCurrency(invoice.amount)}
                </div>
              </div>
              <AlertDialogDescription className="text-sm text-center text-muted-foreground">
                Upewnij się, że kwota została przelana
              </AlertDialogDescription>
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-3">
              <AlertDialogDescription className="text-base font-semibold text-center">
                OSTATECZNE POTWIERDZENIE
              </AlertDialogDescription>
              <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg space-y-2">
                <p className="text-sm text-center font-medium">
                  Tej operacji nie można cofnąć. Faktura zostanie przeniesiona do sekcji opłaconych.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Firma:</span>
                  <span>{invoice.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Kwota:</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            Anuluj
          </AlertDialogCancel>
          <Button onClick={handleNext} variant={stage === 3 ? 'default' : 'default'}>
            {stage === 3 ? (
              <>
                <CheckCircle className="mr-2" size={18} weight="bold" />
                Potwierdź płatność
              </>
            ) : (
              <>Dalej ({stage}/3)</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
