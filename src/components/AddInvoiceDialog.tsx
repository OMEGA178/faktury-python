import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Warning, Image, Package, X, Phone, MapPin, Calendar, User } from '@phosphor-icons/react'
import { validateNIP, formatNIP, calculateDistance } from '@/lib/utils'
import { compressImage } from '@/lib/image-compression'
import { toast } from 'sonner'
import { Location, Driver } from '@/lib/types'

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (invoice: { 
    companyName: string
    nip: string
    amount: number
    deadline: string
    paymentTerm: number
    paymentTermStart?: number
    issueDate?: string
    description?: string
    invoiceImages?: string[]
    cargoImages?: string[]
    contactPhone?: string
    loadingLocation?: Location
    unloadingLocation?: Location
    calculatedDistance?: number
    driverId?: string
  }) => void
  existingNIPs: string[]
  drivers: Driver[]
}

export function AddInvoiceDialog({ open, onOpenChange, onAdd, existingNIPs, drivers }: AddInvoiceDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [nip, setNip] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentTerm, setPaymentTerm] = useState('30')
  const [hasPaymentTermRange, setHasPaymentTermRange] = useState(false)
  const [paymentTermStart, setPaymentTermStart] = useState('30')
  const [deadline, setDeadline] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [contactPhone, setContactPhone] = useState('')
  const [invoiceImages, setInvoiceImages] = useState<string[]>([])
  const [cargoImages, setCargoImages] = useState<string[]>([])
  const [nipError, setNipError] = useState('')
  const [loadingCity, setLoadingCity] = useState('')
  const [loadingAddress, setLoadingAddress] = useState('')
  const [unloadingCity, setUnloadingCity] = useState('')
  const [unloadingAddress, setUnloadingAddress] = useState('')
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [driverId, setDriverId] = useState<string>('')

  const handleNipChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    setNip(cleaned)
    
    if (cleaned.length === 10) {
      if (!validateNIP(cleaned)) {
        setNipError('Nieprawidłowy numer NIP (błędna suma kontrolna)')
      } else {
        setNipError('')
      }
    } else if (cleaned.length > 0) {
      setNipError('NIP musi mieć 10 cyfr')
    } else {
      setNipError('')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'cargo') => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    // Walidacja plików
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        toast.error('Można dodać tylko pliki graficzne')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest za duży (max 10MB)`)
        return
      }
    }

    // Kompresja wszystkich obrazów
    toast.loading(`Kompresowanie ${fileArray.length} zdjęć...`)
    
    try {
      const compressedImageIds = await Promise.all(
        fileArray.map(file => compressImage(file))
      )
      
      if (type === 'invoice') {
        setInvoiceImages(prev => [...prev, ...compressedImageIds])
      } else {
        setCargoImages(prev => [...prev, ...compressedImageIds])
      }
      
      toast.success(`Dodano ${fileArray.length} zdjęć (skompresowane)`)
    } catch (error) {
      console.error('Błąd kompresji obrazów:', error)
      toast.error('Nie udało się przetworzyć zdjęć')
    }
  }

  const removeImage = (index: number, type: 'invoice' | 'cargo') => {
    if (type === 'invoice') {
      setInvoiceImages(prev => prev.filter((_, i) => i !== index))
    } else {
      setCargoImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      toast.error('Wprowadź nazwę firmy')
      return
    }

    if (!validateNIP(nip)) {
      toast.error('Nieprawidłowy numer NIP')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Wprowadź prawidłową kwotę')
      return
    }

    if (!deadline) {
      toast.error('Wybierz termin płatności')
      return
    }

    const deadlineDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (deadlineDate < today) {
      toast.warning('Wybrany termin jest w przeszłości', {
        description: 'Czy na pewno chcesz kontynuować?',
      })
    }

    if (existingNIPs.includes(nip)) {
      toast.info('Ta firma już istnieje w systemie', {
        description: 'Dodaję nową fakturę dla istniejącej firmy',
      })
    }

    let distance: number | undefined = undefined
    let loadingLoc: Location | undefined = undefined
    let unloadingLoc: Location | undefined = undefined

    if (loadingCity.trim() && unloadingCity.trim()) {
      setCalculatingDistance(true)
      try {
        distance = await calculateDistance(loadingCity.trim(), unloadingCity.trim())
        loadingLoc = {
          city: loadingCity.trim(),
          address: loadingAddress.trim() || '',
        }
        unloadingLoc = {
          city: unloadingCity.trim(),
          address: unloadingAddress.trim() || '',
        }
        if (distance > 0) {
          toast.success(`Obliczono dystans: ${distance} km`)
        }
      } catch (error) {
        toast.error('Nie udało się obliczyć dystansu')
      } finally {
        setCalculatingDistance(false)
      }
    }

    onAdd({
      companyName: companyName.trim(),
      nip,
      amount: parseFloat(amount),
      deadline,
      paymentTerm: parseInt(paymentTerm),
      paymentTermStart: hasPaymentTermRange ? parseInt(paymentTermStart) : undefined,
      issueDate,
      description: description.trim() || undefined,
      invoiceImages: invoiceImages.length > 0 ? invoiceImages : undefined,
      cargoImages: cargoImages.length > 0 ? cargoImages : undefined,
      contactPhone: contactPhone.trim() || undefined,
      loadingLocation: loadingLoc,
      unloadingLocation: unloadingLoc,
      calculatedDistance: distance,
      driverId: driverId || undefined,
    })

    setCompanyName('')
    setNip('')
    setAmount('')
    setDescription('')
    setPaymentTerm('30')
    setHasPaymentTermRange(false)
    setPaymentTermStart('30')
    setDeadline('')
    setIssueDate(new Date().toISOString().split('T')[0])
    setContactPhone('')
    setInvoiceImages([])
    setCargoImages([])
    setNipError('')
    setLoadingCity('')
    setLoadingAddress('')
    setUnloadingCity('')
    setUnloadingAddress('')
    setDriverId('')
    onOpenChange(false)
    
    toast.success('Faktura została dodana', {
      description: `${companyName} - ${formatNIP(nip)}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus size={24} weight="bold" className="text-primary" />
            Dodaj nową fakturę
          </DialogTitle>
          <DialogDescription>
            Wprowadź dane firmy i szczegóły faktury do systemu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nazwa firmy</Label>
            <Input
              id="company-name"
              placeholder="np. ABC Sp. z o.o."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              placeholder="0000000000"
              value={nip}
              onChange={(e) => handleNipChange(e.target.value)}
              maxLength={10}
              className={`font-mono ${nipError ? 'border-destructive' : ''}`}
              autoComplete="off"
            />
            {nipError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning size={14} weight="fill" />
                {nipError}
              </p>
            )}
            {nip.length === 10 && !nipError && (
              <p className="text-sm text-muted-foreground font-mono">
                Formatowany: {formatNIP(nip)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Kwota (PLN)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <Textarea
              id="description"
              placeholder="Dodatkowe informacje o fakturze..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-2">
              <Phone size={18} weight="duotone" />
              Numer telefonu kontaktowego (opcjonalnie)
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="np. 123456789"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="font-mono"
              autoComplete="off"
            />
            {contactPhone.length > 0 && contactPhone.length !== 9 && (
              <p className="text-sm text-muted-foreground">
                Wprowadź 9 cyfr numeru telefonu
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-select" className="flex items-center gap-2">
              <User size={18} weight="duotone" />
              Przypisany kierowca (opcjonalnie)
            </Label>
            <Select value={driverId || 'none'} onValueChange={(val) => setDriverId(val === 'none' ? '' : val)}>
              <SelectTrigger id="driver-select">
                <SelectValue placeholder="Wybierz kierowcę..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Brak przypisania</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {driverId && (
              <p className="text-sm text-muted-foreground">
                ✓ Faktura przypisana do kierowcy
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar size={18} weight="duotone" />
              Terminy
            </h3>

            <div className="space-y-2">
              <Label htmlFor="issue-date">Data wystawienia faktury</Label>
              <Input
                id="issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="has-range"
                checked={hasPaymentTermRange}
                onCheckedChange={(checked) => setHasPaymentTermRange(checked === true)}
              />
              <Label htmlFor="has-range" className="text-sm font-normal cursor-pointer">
                Termin płatności ma zakres (od - do)
              </Label>
            </div>

            {hasPaymentTermRange ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-term-start">Termin od (dni)</Label>
                  <Select value={paymentTermStart} onValueChange={setPaymentTermStart}>
                    <SelectTrigger id="payment-term-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 dni</SelectItem>
                      <SelectItem value="7">7 dni</SelectItem>
                      <SelectItem value="14">14 dni</SelectItem>
                      <SelectItem value="30">30 dni</SelectItem>
                      <SelectItem value="60">60 dni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-term">Termin do (dni)</Label>
                  <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                    <SelectTrigger id="payment-term">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dni</SelectItem>
                      <SelectItem value="14">14 dni</SelectItem>
                      <SelectItem value="30">30 dni</SelectItem>
                      <SelectItem value="60">60 dni</SelectItem>
                      <SelectItem value="90">90 dni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="payment-term">Termin płatności</Label>
                <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                  <SelectTrigger id="payment-term">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Gotówka (natychmiast)</SelectItem>
                    <SelectItem value="7">7 dni</SelectItem>
                    <SelectItem value="14">14 dni</SelectItem>
                    <SelectItem value="30">30 dni</SelectItem>
                    <SelectItem value="60">60 dni</SelectItem>
                    <SelectItem value="90">90 dni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deadline">Data ostateczna płatności</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin size={18} weight="duotone" />
              Lokalizacje transportu (opcjonalnie)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loading-city">Miasto załadunku</Label>
                <Input
                  id="loading-city"
                  placeholder="np. Warszawa"
                  value={loadingCity}
                  onChange={(e) => setLoadingCity(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loading-address">Adres załadunku</Label>
                <Input
                  id="loading-address"
                  placeholder="np. ul. Główna 1"
                  value={loadingAddress}
                  onChange={(e) => setLoadingAddress(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unloading-city">Miasto rozładunku</Label>
                <Input
                  id="unloading-city"
                  placeholder="np. Kraków"
                  value={unloadingCity}
                  onChange={(e) => setUnloadingCity(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unloading-address">Adres rozładunku</Label>
                <Input
                  id="unloading-address"
                  placeholder="np. ul. Rynek 5"
                  value={unloadingAddress}
                  onChange={(e) => setUnloadingAddress(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {loadingCity && unloadingCity && (
              <p className="text-sm text-muted-foreground">
                💡 Dystans zostanie automatycznie obliczony po dodaniu faktury
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-images" className="flex items-center gap-2">
                <Image size={18} weight="duotone" />
                Zdjęcia faktury
              </Label>
              <Input
                id="invoice-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'invoice')}
                className="cursor-pointer"
              />
              {invoiceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {invoiceImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Faktura ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(idx, 'invoice')}
                      >
                        <X size={14} weight="bold" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo-images" className="flex items-center gap-2">
                <Package size={18} weight="duotone" />
                Zdjęcia ładunku
              </Label>
              <Input
                id="cargo-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'cargo')}
                className="cursor-pointer"
              />
              {cargoImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {cargoImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Ładunek ${idx + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(idx, 'cargo')}
                      >
                        <X size={14} weight="bold" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={!!nipError || !companyName || !nip || !amount || !deadline || calculatingDistance}>
              <Plus className="mr-2" size={18} weight="bold" />
              {calculatingDistance ? 'Obliczanie...' : 'Dodaj fakturę'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
