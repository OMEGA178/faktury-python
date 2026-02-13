import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Gauge, GasPump, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { Vehicle, FuelEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { VehicleDetailsDialog } from './VehicleDetailsDialog'

interface VehicleStatsProps {
  vehicles: Vehicle[]
  fuelEntries: FuelEntry[]
  onDeleteVehicle?: (vehicleId: string) => void
}

export function VehicleStats({ vehicles, fuelEntries, onDeleteVehicle }: VehicleStatsProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const vehicleStats = useMemo(() => {
    return vehicles.map((vehicle) => {
      const vehicleFuelEntries = fuelEntries
        .filter((entry) => entry.vehicleId === vehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const totalLiters = vehicleFuelEntries.reduce((sum, entry) => sum + entry.liters, 0)
      const totalCost = vehicleFuelEntries.reduce((sum, entry) => sum + entry.amount, 0)
      const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

      const consumptionEntries = vehicleFuelEntries.filter(
        (entry) => entry.calculatedConsumption !== undefined
      )
      const avgConsumption =
        consumptionEntries.length > 0
          ? consumptionEntries.reduce((sum, entry) => sum + (entry.calculatedConsumption || 0), 0) /
            consumptionEntries.length
          : 0

      const latestEntry = vehicleFuelEntries[0]
      const oldestEntry = vehicleFuelEntries[vehicleFuelEntries.length - 1]
      const totalDistance = latestEntry && oldestEntry 
        ? latestEntry.odometerReading - oldestEntry.odometerReading 
        : 0

      const lastConsumption = consumptionEntries[0]?.calculatedConsumption || 0
      const consumptionDiff = lastConsumption - vehicle.expectedFuelConsumption

      return {
        vehicle,
        totalLiters,
        totalCost,
        avgPricePerLiter,
        avgConsumption,
        totalDistance,
        fuelingsCount: vehicleFuelEntries.length,
        lastConsumption,
        consumptionDiff,
        latestOdometer: latestEntry?.odometerReading || vehicle.initialOdometerReading,
      }
    })
  }, [vehicles, fuelEntries])

  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setDetailsOpen(true)
  }

  const handleDeleteVehicle = (vehicleId: string) => {
    if (onDeleteVehicle) {
      onDeleteVehicle(vehicleId)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicleStats.map((stats) => (
            <Card 
              key={stats.vehicle.id} 
              className="hover:shadow-lg transition-all border-primary/20 cursor-pointer hover:border-primary/40"
              onClick={() => handleCardClick(stats.vehicle)}
            >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">
                    {stats.vehicle.brand} {stats.vehicle.model}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car size={16} weight="duotone" />
                    <span>{stats.vehicle.driverName}</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GasPump size={24} weight="duotone" className="text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Przebieg</p>
                  <p className="text-lg font-bold font-mono">
                    {stats.latestOdometer.toLocaleString('pl-PL')} km
                  </p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Tankowania</p>
                  <p className="text-lg font-bold font-mono">{stats.fuelingsCount}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Średnie spalanie</p>
                  <Gauge size={20} weight="duotone" className="text-primary" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {stats.avgConsumption > 0 ? stats.avgConsumption.toFixed(2) : '—'}
                  </p>
                  <span className="text-sm text-muted-foreground mb-1">L/100km</span>
                </div>
                {stats.avgConsumption > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Oczekiwane: {stats.vehicle.expectedFuelConsumption.toFixed(1)} L/100km
                    </span>
                    {Math.abs(stats.consumptionDiff) > 0.1 && (
                      <div className={`flex items-center gap-1 ${
                        stats.consumptionDiff > 0 
                          ? 'text-destructive' 
                          : stats.consumptionDiff < 0 
                          ? 'text-success' 
                          : 'text-muted-foreground'
                      }`}>
                        {stats.consumptionDiff > 0 ? (
                          <TrendUp size={14} weight="bold" />
                        ) : stats.consumptionDiff < 0 ? (
                          <TrendDown size={14} weight="bold" />
                        ) : (
                          <Minus size={14} weight="bold" />
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(stats.consumptionDiff).toFixed(2)} L
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Koszt paliwa</p>
                  <p className="text-sm font-bold font-mono text-foreground">
                    {formatCurrency(stats.totalCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Śr. cena</p>
                  <p className="text-sm font-bold font-mono text-foreground">
                    {stats.avgPricePerLiter.toFixed(2)} PLN/L
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Przejechano</span>
                  <span className="font-semibold font-mono text-foreground">
                    {stats.totalDistance.toLocaleString('pl-PL')} km
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Zużyto</span>
                  <span className="font-semibold font-mono text-foreground">
                    {stats.totalLiters.toFixed(1)} L
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    <VehicleDetailsDialog
      open={detailsOpen}
      onOpenChange={setDetailsOpen}
      vehicle={selectedVehicle}
      onDelete={handleDeleteVehicle}
      fuelEntriesCount={
        selectedVehicle 
          ? fuelEntries.filter((entry) => entry.vehicleId === selectedVehicle.id).length 
          : 0
      }
    />
  </>
  )
}
