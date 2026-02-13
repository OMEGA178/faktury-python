import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Vehicle } from '@/lib/types'
import { Car, Phone, Calendar, Palette, Engine, Gauge, Speedometer, Trash, Pencil } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface VehicleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onDelete?: (vehicleId: string) => void
  fuelEntriesCount?: number
}

export function VehicleDetailsDialog({
  open,
  onOpenChange,
  vehicle,
  onDelete,
  fuelEntriesCount = 0,
}: VehicleDetailsDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (!vehicle) return null

  const handleDelete = () => {
    if (onDelete) {
      onDelete(vehicle.id)
      setDeleteDialogOpen(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Car size={28} weight="duotone" className="text-primary" />
              </div>
              {vehicle.brand} {vehicle.model}
            </DialogTitle>
            <DialogDescription>Szczegóły pojazdu</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar size={18} weight="duotone" />
                  <span className="text-sm">Rok produkcji</span>
                </div>
                <p className="text-xl font-bold font-mono">{vehicle.year}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Palette size={18} weight="duotone" />
                  <span className="text-sm">Kolor</span>
                </div>
                <p className="text-xl font-bold">{vehicle.color}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Engine size={18} weight="duotone" />
                  <span className="text-sm">Silnik</span>
                </div>
                <p className="text-lg font-semibold">{vehicle.engineType}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Gauge size={18} weight="duotone" />
                  <span className="text-sm">Oczekiwane spalanie</span>
                </div>
                <p className="text-xl font-bold font-mono">
                  {vehicle.expectedFuelConsumption.toFixed(1)} L/100km
                </p>
              </div>

              <div className="col-span-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Speedometer size={18} weight="duotone" />
                  <span className="text-sm">Początkowy stan licznika</span>
                </div>
                <p className="text-xl font-bold font-mono">
                  {vehicle.initialOdometerReading.toLocaleString('pl-PL')} km
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Dane kierowcy</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car size={20} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Imię i nazwisko</p>
                    <p className="font-semibold text-foreground">{vehicle.driverName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Phone size={20} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numer telefonu</p>
                    <p className="font-semibold font-mono text-foreground">{vehicle.driverPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {fuelEntriesCount > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Ten pojazd ma przypisanych <span className="font-bold text-foreground">{fuelEntriesCount}</span> wpisów
                  paliwowych
                </p>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4 border-t border-border">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={fuelEntriesCount > 0}
              >
                <Trash className="mr-2" size={18} weight="bold" />
                Usuń pojazd
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Zamknij
              </Button>
            </div>

            {fuelEntriesCount > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Nie można usunąć pojazdu, który ma przypisane tankowania
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten pojazd?</AlertDialogTitle>
            <AlertDialogDescription>
              Pojazd <strong>{vehicle.brand} {vehicle.model}</strong> zostanie trwale usunięty. Tej operacji nie można
              cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
