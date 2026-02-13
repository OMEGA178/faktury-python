import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Phone, Envelope, IdentificationCard, Car, CurrencyCircleDollar, PencilSimple, X, CheckCircle } from '@phosphor-icons/react'
import { Driver } from '@/lib/types'
import { formatPhoneNumber, formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface DriversTabProps {
  drivers: Driver[]
  onUpdateDriver: (driverId: string, updates: Partial<Driver>) => void
}

export function DriversTab({ drivers, onUpdateDriver }: DriversTabProps) {
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null)
  const [editedDailyCost, setEditedDailyCost] = useState<string>('')

  const handleStartEdit = (driver: Driver) => {
    setEditingDriverId(driver.id)
    setEditedDailyCost(driver.dailyCost?.toString() || '')
  }

  const handleSaveEdit = (driverId: string) => {
    const dailyCost = editedDailyCost ? parseFloat(editedDailyCost) : undefined
    onUpdateDriver(driverId, { dailyCost })
    setEditingDriverId(null)
    setEditedDailyCost('')
  }

  const handleCancelEdit = () => {
    setEditingDriverId(null)
    setEditedDailyCost('')
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-16 bg-card border border-dashed border-border rounded-lg">
        <User size={64} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">Brak kierowców</h3>
        <p className="text-muted-foreground">Rozpocznij od dodania pierwszego kierowcy</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Zarządzanie kierowcami</h2>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Łącznie: {drivers.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {drivers.map((driver) => {
          const isEditing = editingDriverId === driver.id

          return (
            <Card key={driver.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20">
                      <User size={24} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{driver.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Dodano: {new Date(driver.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone size={14} weight="duotone" />
                    Telefon:
                  </span>
                  <a 
                    href={`tel:${driver.phone}`}
                    className="font-mono font-medium text-primary hover:underline"
                  >
                    {formatPhoneNumber(driver.phone)}
                  </a>
                </div>

                {driver.email && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Envelope size={14} weight="duotone" />
                      Email:
                    </span>
                    <a 
                      href={`mailto:${driver.email}`}
                      className="text-primary hover:underline text-xs"
                    >
                      {driver.email}
                    </a>
                  </div>
                )}

                {driver.registrationNumber && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <IdentificationCard size={14} weight="duotone" />
                      Nr rejestracyjny:
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {driver.registrationNumber}
                    </span>
                  </div>
                )}

                {driver.carBrand && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Car size={14} weight="duotone" />
                      Pojazd:
                    </span>
                    <span className="font-medium text-foreground">
                      {driver.carBrand}
                      {driver.carColor && ` (${driver.carColor})`}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-3 mt-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`daily-cost-${driver.id}`} className="text-sm font-medium flex items-center gap-2">
                          <CurrencyCircleDollar size={16} weight="bold" />
                          Dniówka (PLN)
                        </Label>
                        <Input
                          id={`daily-cost-${driver.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={editedDailyCost}
                          onChange={(e) => setEditedDailyCost(e.target.value)}
                          placeholder="np. 300"
                          className="h-10 font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(driver.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="mr-1" size={16} weight="bold" />
                          Zapisz
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="mr-1" size={16} weight="bold" />
                          Anuluj
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm bg-muted/40 p-3 rounded-lg border border-border">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <CurrencyCircleDollar size={14} weight="duotone" />
                          Dniówka:
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {driver.dailyCost ? formatCurrency(driver.dailyCost) : 'Nie ustawiono'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(driver)}
                        className="w-full"
                      >
                        <PencilSimple className="mr-1" size={16} weight="bold" />
                        Edytuj dniówkę
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
