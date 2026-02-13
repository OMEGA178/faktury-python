import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GasPump, Trash, Gauge, Path } from '@phosphor-icons/react'
import { FuelEntry, Vehicle } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface FuelCardProps {
  fuel: FuelEntry
  vehicle?: Vehicle
  onDelete: (id: string) => void
}

export function FuelCard({ fuel, vehicle, onDelete }: FuelCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-destructive/30 bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className="bg-destructive/20 p-2 rounded-lg h-fit border border-destructive/40">
              <GasPump size={24} weight="duotone" className="text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-lg text-foreground">{formatDate(fuel.date)}</p>
              </div>
              {vehicle && (
                <p className="text-sm text-muted-foreground">
                  {vehicle.brand} {vehicle.model}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Kwota</p>
                  <p className="font-mono font-semibold text-foreground">{formatCurrency(fuel.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Litry</p>
                  <p className="font-mono font-semibold text-foreground">{fuel.liters.toFixed(2)} L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cena za litr</p>
                  <p className="font-mono font-semibold text-foreground">{fuel.pricePerLiter.toFixed(2)} PLN/L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Gauge size={14} weight="duotone" />
                    Stan licznika
                  </p>
                  <p className="font-mono font-semibold text-foreground">{fuel.odometerReading.toLocaleString('pl-PL')} km</p>
                </div>
                {fuel.calculatedConsumption !== undefined && (
                  <div className="col-span-2 mt-1 p-2 bg-card rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Path size={14} weight="duotone" />
                      Spalanie od ostatniego tankowania
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="font-mono font-bold text-foreground">
                        {fuel.calculatedConsumption.toFixed(2)} L/100km
                      </p>
                      {fuel.distanceSinceLastFuel && (
                        <p className="text-xs text-muted-foreground">
                          ({fuel.distanceSinceLastFuel} km)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(fuel.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/20"
          >
            <Trash size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
