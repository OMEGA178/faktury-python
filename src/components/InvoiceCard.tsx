import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Buildings, Calendar, TrendUp, TrendDown, Image, Package, Phone, PencilSimple, MapPin, NavigationArrow, User, GasPump, CurrencyCircleDollar } from '@phosphor-icons/react'
import { Invoice, Driver, FuelEntry, Vehicle } from '@/lib/types'
import { formatCurrency, formatDate, formatNIP, formatPhoneNumber, isOverdue, calculateTripCostPerKm } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ImagePreviewDialog } from './ImagePreviewDialog'
import { useState, useMemo } from 'react'

interface InvoiceCardProps {
  invoice: Invoice
  onMarkAsPaid?: (invoice: Invoice) => void
  onViewDetails?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  showScore?: boolean
  scoreChange?: number
  drivers?: Driver[]
  fuelEntries?: FuelEntry[]
  vehicles?: Vehicle[]
}

export function InvoiceCard({ invoice, onMarkAsPaid, onViewDetails, onEdit, showScore, scoreChange, drivers, fuelEntries, vehicles }: InvoiceCardProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewTitle, setPreviewTitle] = useState('')

  const overdue = !invoice.isPaid && isOverdue(invoice.deadline, invoice.issueDate, invoice.paymentTermStart)
  const onTime = invoice.isPaid && invoice.paidOnTime
  
  const assignedDriver = drivers?.find(d => d.id === invoice.driverId)

  const fuelCostForTrip = useMemo(() => {
    if (!invoice.issueDate || !fuelEntries || fuelEntries.length === 0 || !invoice.calculatedDistance) return 0

    const issueDate = new Date(invoice.issueDate)
    const threeDaysBefore = new Date(issueDate)
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3)
    const threeDaysAfter = new Date(issueDate)
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3)

    let relevantFuelEntries = fuelEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= threeDaysBefore && entryDate <= threeDaysAfter
    })

    if (invoice.driverId && assignedDriver) {
      relevantFuelEntries = relevantFuelEntries.filter(entry => {
        const vehicle = (vehicles || []).find(v => v.id === entry.vehicleId)
        return vehicle && (
          vehicle.driverName === assignedDriver.name ||
          vehicle.driverPhone === assignedDriver.phone
        )
      })
    }

    if (relevantFuelEntries.length === 0) return 0

    const totalLiters = relevantFuelEntries.reduce((sum, entry) => sum + entry.liters, 0)
    const avgConsumption = 12
    const estimatedLitersForTrip = (invoice.calculatedDistance / 100) * avgConsumption
    const avgPricePerLiter = relevantFuelEntries.reduce((sum, entry) => sum + entry.pricePerLiter, 0) / relevantFuelEntries.length

    return Math.min(
      estimatedLitersForTrip * avgPricePerLiter,
      relevantFuelEntries.reduce((sum, entry) => sum + entry.amount, 0)
    )
  }, [invoice.issueDate, invoice.driverId, invoice.calculatedDistance, fuelEntries, assignedDriver, vehicles])

  const tripCosts = useMemo(() => {
    if (!invoice.calculatedDistance || invoice.calculatedDistance === 0) {
      return null
    }

    const tripDays = invoice.paymentTerm === 0 ? 1 : Math.max(1, Math.ceil(invoice.calculatedDistance / 500))
    const forwarderCost = invoice.amount * 0.05

    return calculateTripCostPerKm({
      revenue: invoice.amount,
      distance: invoice.calculatedDistance,
      fuelCost: fuelCostForTrip,
      driverDailyCost: assignedDriver?.dailyCost,
      tripDays,
      forwarderCost,
    })
  }, [invoice.amount, invoice.calculatedDistance, fuelCostForTrip, assignedDriver?.dailyCost, invoice.paymentTerm])

  const handleImageClick = (images: string[], title: string) => {
    setPreviewImages(images)
    setPreviewTitle(title)
    setImagePreviewOpen(true)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`hover:shadow-md transition-shadow ${overdue ? 'border-destructive/50 bg-destructive/10' : ''} ${invoice.isPaid ? 'border-success/40 bg-success/5' : 'bg-card/80'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Buildings className="text-primary" size={20} weight="duotone" />
                <h3 className="font-semibold text-lg leading-none cursor-pointer hover:text-primary transition-colors text-foreground" onClick={() => onViewDetails?.(invoice)}>
                  {invoice.companyName}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                NIP: {formatNIP(invoice.nip)}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {invoice.isPaid ? (
                <Badge variant="outline" className="bg-success/20 text-success-foreground border-success/40">
                  <CheckCircle className="mr-1" size={14} weight="fill" />
                  Opłacone
                </Badge>
              ) : overdue ? (
                <Badge variant="destructive" className="animate-pulse bg-destructive/20 border-destructive/40">
                  <Clock className="mr-1" size={14} weight="fill" />
                  Zaległość
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-secondary/20 text-foreground border-secondary/40">
                  <Clock className="mr-1" size={14} weight="fill" />
                  Oczekuje
                </Badge>
              )}
              {showScore && scoreChange !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Badge variant="outline" className={scoreChange > 0 ? 'bg-success/20 text-success-foreground border-success/40' : 'bg-destructive/20 text-destructive-foreground border-destructive/40'}>
                    {scoreChange > 0 ? <TrendUp className="mr-1" size={14} weight="bold" /> : <TrendDown className="mr-1" size={14} weight="bold" />}
                    {scoreChange > 0 ? '+' : ''}{scoreChange} pkt
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Kwota:</span>
            <span className="text-2xl font-semibold font-mono text-foreground">{formatCurrency(invoice.amount)}</span>
          </div>

          {invoice.description && (
            <div className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 py-1">
              {invoice.description}
            </div>
          )}

          {invoice.issueDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar size={14} />
                Data wystawienia:
              </span>
              <span className="font-mono font-medium text-foreground">
                {formatDate(invoice.issueDate)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              Termin płatności:
            </span>
            <span className="font-medium text-foreground">
              {invoice.paymentTermStart !== undefined 
                ? `${invoice.paymentTermStart}-${invoice.paymentTerm} dni`
                : invoice.paymentTerm === 0 
                  ? 'Gotówka' 
                  : `${invoice.paymentTerm} dni`
              }
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              Data ostateczna:
            </span>
            <span className={`font-mono font-medium ${overdue ? 'text-destructive' : 'text-foreground'}`}>
              {formatDate(invoice.deadline)}
            </span>
          </div>

          {invoice.isPaid && invoice.paidAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle size={14} />
                Opłacono:
              </span>
              <span className={`font-mono font-medium ${onTime ? 'text-success' : 'text-secondary'}`}>
                {formatDate(invoice.paidAt)}
                {onTime ? ' (na czas)' : ' (po terminie)'}
              </span>
            </div>
          )}

          {assignedDriver && (
            <div className="space-y-1.5 text-sm border-t border-border pt-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User size={14} weight="duotone" />
                  Kierowca:
                </span>
                <span className="font-medium text-foreground">
                  {assignedDriver.name}
                </span>
              </div>
              {assignedDriver.registrationNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Nr rejestracyjny:
                  </span>
                  <span className="font-mono font-medium text-foreground text-xs">
                    {assignedDriver.registrationNumber}
                  </span>
                </div>
              )}
              {assignedDriver && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Pojazd:
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {assignedDriver.carBrand}
                    {assignedDriver.carColor && ` (${assignedDriver.carColor})`}
                  </span>
                </div>
              )}
              {assignedDriver?.dailyCost && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Dniówka:
                  </span>
                  <span className="font-mono font-medium text-foreground text-xs">
                    {formatCurrency(assignedDriver.dailyCost)}/dzień
                  </span>
                </div>
              )}
            </div>
          )}

          {invoice.contactPhone && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone size={14} weight="duotone" />
                Telefon kontaktowy:
              </span>
              <a 
                href={`tel:${invoice.contactPhone}`}
                className="font-mono font-medium text-primary hover:underline"
              >
                {formatPhoneNumber(invoice.contactPhone)}
              </a>
            </div>
          )}

          {invoice.loadingLocation && invoice.unloadingLocation && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} weight="duotone" />
                  Załadunek:
                </span>
                <span className="text-right font-medium text-foreground">
                  {invoice.loadingLocation.city}
                  {invoice.loadingLocation.address && (
                    <span className="block text-xs text-muted-foreground">
                      {invoice.loadingLocation.address}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} weight="fill" />
                  Rozładunek:
                </span>
                <span className="text-right font-medium text-foreground">
                  {invoice.unloadingLocation.city}
                  {invoice.unloadingLocation.address && (
                    <span className="block text-xs text-muted-foreground">
                      {invoice.unloadingLocation.address}
                    </span>
                  )}
                </span>
              </div>
              {invoice.calculatedDistance && invoice.calculatedDistance > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <NavigationArrow size={14} weight="duotone" />
                      Dystans:
                    </span>
                    <span className="font-mono font-semibold text-accent">
                      {invoice.calculatedDistance} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-primary/15 -mx-4 px-4 py-2 rounded-lg border border-primary/30">
                    <span className="text-foreground font-medium">
                      Przychód za kilometr:
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {formatCurrency(invoice.amount / invoice.calculatedDistance)}/km
                    </span>
                  </div>

                  {tripCosts && (
                    <div className="space-y-2.5 -mx-4 px-4 py-3 bg-muted/60 rounded-lg border border-border">
                      <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                        Analiza kosztów transportu:
                      </div>
                      
                      <div className="space-y-1.5">
                        {fuelCostForTrip > 0 && (
                          <>
                            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <GasPump size={12} weight="duotone" />
                                Koszt paliwa (±3 dni):
                              </span>
                              <span className="font-mono font-medium text-destructive">
                                -{formatCurrency(fuelCostForTrip)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground ml-4">
                                Na kilometr:
                              </span>
                              <span className="font-mono text-destructive/80">
                                -{formatCurrency(tripCosts.fuelCostPerKm)}/km
                              </span>
                            </div>
                          </>
                        )}
                        
                        {assignedDriver?.dailyCost && (
                          <>
                            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50 mt-2">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <User size={12} weight="duotone" />
                                Koszt kierowcy ({Math.max(1, Math.ceil(invoice.calculatedDistance / 500))} dni):
                              </span>
                              <span className="font-mono font-medium text-destructive">
                                -{formatCurrency(assignedDriver.dailyCost * Math.max(1, Math.ceil(invoice.calculatedDistance / 500)))}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground ml-4">
                                Na kilometr:
                              </span>
                              <span className="font-mono text-destructive/80">
                                -{formatCurrency(tripCosts.driverCostPerKm)}/km
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50 mt-2">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CurrencyCircleDollar size={12} weight="duotone" />
                            Koszt spedytora (5%):
                          </span>
                          <span className="font-mono font-medium text-destructive">
                            -{formatCurrency(invoice.amount * 0.05)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground ml-4">
                            Na kilometr:
                          </span>
                          <span className="font-mono text-destructive/80">
                            -{formatCurrency(tripCosts.forwarderCostPerKm)}/km
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold bg-accent/20 -mx-4 px-4 py-2 rounded-md border border-accent/40 mt-3">
                          <span className="text-foreground">
                            Suma kosztów:
                          </span>
                          <span className="font-mono font-bold text-destructive">
                            -{formatCurrency(tripCosts.totalCosts)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm font-bold bg-success/20 -mx-4 px-4 py-2.5 rounded-md border-2 border-success/50 mt-2">
                          <span className="text-foreground">
                            💰 Czysty zysk:
                          </span>
                          <span className="font-mono font-bold text-success text-base">
                            {formatCurrency(tripCosts.netProfit)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-success/15 -mx-4 px-4 py-2 rounded-md border border-success/30 mt-1">
                          <span className="text-foreground font-medium">
                            Czysty zysk na km:
                          </span>
                          <span className="font-mono font-bold text-success">
                            {formatCurrency(tripCosts.netProfitPerKm)}/km
                          </span>
                        </div>
                      </div>

                      {!assignedDriver?.dailyCost && fuelCostForTrip === 0 && (
                        <div className="text-xs text-muted-foreground italic text-center py-2 mt-2 border-t border-border">
                          ⚠️ Brak danych o kosztach paliwa i kierowcy dla tego transportu
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(invoice.invoiceImages || invoice.cargoImages) && (
            <div className="flex gap-2 pt-2">
              {invoice.invoiceImages && invoice.invoiceImages.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleImageClick(invoice.invoiceImages!, 'Zdjęcia faktury')}
                >
                  <Image size={12} weight="duotone" />
                  {invoice.invoiceImages.length} faktura
                </Badge>
              )}
              {invoice.cargoImages && invoice.cargoImages.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleImageClick(invoice.cargoImages!, 'Zdjęcia ładunku')}
                >
                  <Package size={12} weight="duotone" />
                  {invoice.cargoImages.length} ładunek
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {!invoice.isPaid && onMarkAsPaid && (
          <CardFooter className="pt-3">
            <Button 
              onClick={() => onMarkAsPaid(invoice)} 
              className="w-full"
              variant="default"
            >
              <CheckCircle className="mr-2" size={18} weight="bold" />
              Oznacz jako opłacone
            </Button>
          </CardFooter>
        )}

        {invoice.isPaid && onEdit && (
          <CardFooter className="pt-3">
            <Button 
              onClick={() => onEdit(invoice)} 
              className="w-full"
              variant="outline"
            >
              <PencilSimple className="mr-2" size={18} weight="bold" />
              Edytuj fakturę
            </Button>
          </CardFooter>
        )}
      </Card>

      <ImagePreviewDialog
        open={imagePreviewOpen}
        onOpenChange={setImagePreviewOpen}
        images={previewImages}
        title={previewTitle}
      />
    </motion.div>
  )
}
