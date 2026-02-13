import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Phone, Envelope, IdentificationCard, Car, Palette, CurrencyCircleDollar } from '@phosphor-icons/react'

interface AddDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { name: string; phone: string; email?: string; registrationNumber?: string; carBrand?: string; carColor?: string; dailyCost?: number }) => void
}

export function AddDriverDialog({ open, onOpenChange, onAdd }: AddDriverDialogProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [carBrand, setCarBrand] = useState('')
  const [carColor, setCarColor] = useState('')
  const [dailyCost, setDailyCost] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !phone.trim()) {
      return
    }

    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
      carBrand: carBrand.trim() || undefined,
      carColor: carColor.trim() || undefined,
      dailyCost: dailyCost ? parseFloat(dailyCost) : undefined,
    })

    setName('')
    setPhone('')
    setEmail('')
    setRegistrationNumber('')
    setCarBrand('')
    setCarColor('')
    setDailyCost('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User size={28} weight="duotone" className="text-primary" />
            Dodaj nowego kierowcę
          </DialogTitle>
          <DialogDescription>
            Wypełnij dane nowego kierowcy. Wymagane są imię, nazwisko i numer telefonu. Informacje o pojeździe są opcjonalne.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="driver-name" className="text-sm font-medium flex items-center gap-2">
              <User size={16} weight="bold" />
              Imię i nazwisko *
            </Label>
            <Input
              id="driver-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Jan Kowalski"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-phone" className="text-sm font-medium flex items-center gap-2">
              <Phone size={16} weight="bold" />
              Numer telefonu *
            </Label>
            <Input
              id="driver-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="np. 123 456 789"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-email" className="text-sm font-medium flex items-center gap-2">
              <Envelope size={16} weight="bold" />
              Email (opcjonalnie)
            </Label>
            <Input
              id="driver-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. jan.kowalski@example.com"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-cost" className="text-sm font-medium flex items-center gap-2">
              <CurrencyCircleDollar size={16} weight="bold" />
              Dniówka (PLN) (opcjonalnie)
            </Label>
            <Input
              id="daily-cost"
              type="number"
              step="0.01"
              min="0"
              value={dailyCost}
              onChange={(e) => setDailyCost(e.target.value)}
              placeholder="np. 300"
              className="h-12 font-mono"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Car size={18} weight="duotone" className="text-primary" />
              Informacje o samochodzie (opcjonalnie)
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration-number" className="text-sm font-medium flex items-center gap-2">
                  <IdentificationCard size={16} weight="bold" />
                  Numer rejestracyjny
                </Label>
                <Input
                  id="registration-number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="np. WA 12345"
                  className="h-12 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-brand" className="text-sm font-medium flex items-center gap-2">
                  <Car size={16} weight="bold" />
                  Marka samochodu
                </Label>
                <Input
                  id="car-brand"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  placeholder="np. Iveco Daily"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-color" className="text-sm font-medium flex items-center gap-2">
                  <Palette size={16} weight="bold" />
                  Kolor samochodu
                </Label>
                <Input
                  id="car-color"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  placeholder="np. biały"
                  className="h-12"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={!name.trim() || !phone.trim()}>
              Dodaj kierowcę
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
