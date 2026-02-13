import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Car, X } from '@phosphor-icons/react'

interface AddVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: {
    brand: string
    model: string
    year: number
    color: string
    engineType: string
    expectedFuelConsumption: number
    initialOdometerReading: number
    driverName: string
    driverPhone: string
  }) => void
}

export function AddVehicleDialog({ open, onOpenChange, onAdd }: AddVehicleDialogProps) {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [engineType, setEngineType] = useState('')
  const [expectedFuelConsumption, setExpectedFuelConsumption] = useState('')
  const [initialOdometerReading, setInitialOdometerReading] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!brand || !model || !year || !color || !engineType || !expectedFuelConsumption || !initialOdometerReading || !driverName || !driverPhone) {
      return
    }

    onAdd({
      brand,
      model,
      year: parseInt(year),
      color,
      engineType,
      expectedFuelConsumption: parseFloat(expectedFuelConsumption),
      initialOdometerReading: parseInt(initialOdometerReading),
      driverName,
      driverPhone,
    })

    setBrand('')
    setModel('')
    setYear('')
    setColor('')
    setEngineType('')
    setExpectedFuelConsumption('')
    setInitialOdometerReading('')
    setDriverName('')
    setDriverPhone('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Car size={28} weight="duotone" className="text-primary" />
            Dodaj pojazd
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                placeholder="np. Iveco"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="np. Daily 72C18"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Rok produkcji</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Kolor</Label>
              <Input
                id="color"
                placeholder="np. Biały"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineType">Silnik</Label>
              <Input
                id="engineType"
                placeholder="np. Diesel Euro 6"
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedFuelConsumption">Przewidywane spalanie (L/100km)</Label>
              <Input
                id="expectedFuelConsumption"
                type="number"
                step="0.1"
                placeholder="12.0"
                value={expectedFuelConsumption}
                onChange={(e) => setExpectedFuelConsumption(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialOdometerReading">Stan licznika początkowy (km)</Label>
              <Input
                id="initialOdometerReading"
                type="number"
                placeholder="0"
                value={initialOdometerReading}
                onChange={(e) => setInitialOdometerReading(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverName">Imię i nazwisko kierowcy</Label>
              <Input
                id="driverName"
                placeholder="Jan Kowalski"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="driverPhone">Nr telefonu do kierowcy</Label>
              <Input
                id="driverPhone"
                type="tel"
                placeholder="123 456 789"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="mr-2" size={18} />
              Anuluj
            </Button>
            <Button type="submit">
              <Car className="mr-2" size={18} weight="bold" />
              Dodaj pojazd
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
