import { useMemo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, Phone } from '@phosphor-icons/react'
import { Invoice } from '@/lib/types'
import { getDaysUntilDeadline, formatCurrency, formatNIP, formatPhoneNumber } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationBannerProps {
  invoices: Invoice[]
}

export function NotificationBanner({ invoices }: NotificationBannerProps) {
  const upcomingInvoices = useMemo(() => {
    return invoices
      .filter(inv => !inv.isPaid)
      .map(inv => ({
        ...inv,
        daysLeft: getDaysUntilDeadline(inv.deadline)
      }))
      .filter(inv => inv.daysLeft > 0 && inv.daysLeft <= 3)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [invoices])

  const overdueInvoices = useMemo(() => {
    return invoices
      .filter(inv => !inv.isPaid)
      .map(inv => ({
        ...inv,
        daysOverdue: Math.abs(getDaysUntilDeadline(inv.deadline))
      }))
      .filter(inv => getDaysUntilDeadline(inv.deadline) < 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [invoices])

  if (upcomingInvoices.length === 0 && overdueInvoices.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {overdueInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="border-2 animate-pulse">
              <Bell className="h-5 w-5" weight="fill" />
              <AlertTitle className="text-lg font-semibold">
                Zaległe płatności ({overdueInvoices.length})
              </AlertTitle>
              <AlertDescription className="mt-3">
                <div className="space-y-2">
                  {overdueInvoices.slice(0, 3).map(invoice => (
                    <div 
                      key={invoice.id} 
                      className="bg-background/50 rounded-md p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{invoice.companyName}</div>
                        <div className="text-sm flex items-center gap-2 flex-wrap mt-1">
                          <span className="font-mono">{formatNIP(invoice.nip)}</span>
                          <span>•</span>
                          <span className="font-mono font-bold">{formatCurrency(invoice.amount)}</span>
                          <span>•</span>
                          <Badge variant="destructive" className="text-xs">
                            Zaległość {invoice.daysOverdue} {invoice.daysOverdue === 1 ? 'dzień' : 'dni'}
                          </Badge>
                          {invoice.contactPhone && (
                            <>
                              <span>•</span>
                              <a 
                                href={`tel:${invoice.contactPhone}`}
                                className="flex items-center gap-1 text-foreground hover:underline"
                              >
                                <Phone size={14} weight="duotone" />
                                {formatPhoneNumber(invoice.contactPhone)}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {overdueInvoices.length > 3 && (
                    <div className="text-sm text-center text-muted-foreground pt-1">
                      i jeszcze {overdueInvoices.length - 3} {overdueInvoices.length - 3 === 1 ? 'faktura' : 'faktury'}...
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {upcomingInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Alert className="border-warning bg-warning/5 border-2">
              <Clock className="h-5 w-5 text-warning-foreground" weight="fill" />
              <AlertTitle className="text-lg font-semibold text-warning-foreground">
                Zbliżające się terminy ({upcomingInvoices.length})
              </AlertTitle>
              <AlertDescription className="mt-3">
                <div className="space-y-2">
                  {upcomingInvoices.slice(0, 3).map(invoice => (
                    <div 
                      key={invoice.id} 
                      className="bg-background rounded-md p-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{invoice.companyName}</div>
                        <div className="text-sm flex items-center gap-2 flex-wrap mt-1">
                          <span className="font-mono">{formatNIP(invoice.nip)}</span>
                          <span>•</span>
                          <span className="font-mono font-bold">{formatCurrency(invoice.amount)}</span>
                          <span>•</span>
                          <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/40 text-xs">
                            Pozostało {invoice.daysLeft} {invoice.daysLeft === 1 ? 'dzień' : 'dni'}
                          </Badge>
                          {invoice.contactPhone && (
                            <>
                              <span>•</span>
                              <a 
                                href={`tel:${invoice.contactPhone}`}
                                className="flex items-center gap-1 text-foreground hover:underline"
                              >
                                <Phone size={14} weight="duotone" />
                                {formatPhoneNumber(invoice.contactPhone)}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingInvoices.length > 3 && (
                    <div className="text-sm text-center text-muted-foreground pt-1">
                      i jeszcze {upcomingInvoices.length - 3} {upcomingInvoices.length - 3 === 1 ? 'faktura' : 'faktury'}...
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
