import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GasPump } from '@phosphor-icons/react'
import { Vehicle } from '@/lib/types'

interface AddFuelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { vehicleId: string; date: string; amount: number; liters: number; odometerReading: number }) => void
  vehicles: Vehicle[]
}

export function AddFuelDialog({ open, onOpenChange, onAdd, vehicles }: AddFuelDialogProps) {
  const [vehicleId, setVehicleId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [liters, setLiters] = useState('')
  const [odometerReading, setOdometerReading] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)
    const litersNum = parseFloat(liters)
    const odometerNum = parseInt(odometerReading)

    if (!vehicleId || isNaN(amountNum) || isNaN(litersNum) || isNaN(odometerNum) || amountNum <= 0 || litersNum <= 0 || odometerNum <= 0) {
      return
    }

    onAdd({
      vehicleId,
      date,
      amount: amountNum,
      liters: litersNum,
      odometerReading: odometerNum,
    })

    setVehicleId('')
    setDate(new Date().toISOString().split('T')[0])
    setAmount('')
    setLiters('')
    setOdometerReading('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GasPump size={24} weight="duotone" />
            Dodaj tankowanie
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Pojazd</Label>
            {vehicles.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                Brak pojazdów. Najpierw dodaj pojazd.
              </div>
            ) : (
              <Select value={vehicleId} onValueChange={setVehicleId} required>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Wybierz pojazd" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.driverName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-date">Data tankowania</Label>
            <Input
              id="fuel-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometer-reading">Stan licznika (km)</Label>
            <Input
              id="odometer-reading"
              type="number"
              min="0"
              placeholder="0"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-amount">Kwota (PLN)</Label>
            <Input
              id="fuel-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-liters">Ilość litrów</Label>
            <Input
              id="fuel-liters"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              required
            />
          </div>

          {amount && liters && parseFloat(liters) > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cena za litr</p>
              <p className="text-lg font-mono font-semibold">
                {(parseFloat(amount) / parseFloat(liters)).toFixed(2)} PLN/L
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={vehicles.length === 0}>
              Dodaj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
