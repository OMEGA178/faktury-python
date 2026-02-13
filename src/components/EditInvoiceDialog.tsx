import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PencilSimple, Warning, Image, Package, X, Phone, MapPin, Calendar } from '@phosphor-icons/react'
import { validateNIP, formatNIP, calculateDistance } from '@/lib/utils'
import { toast } from 'sonner'
import { Invoice, Location } from '@/lib/types'

interface EditInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSave: (updatedInvoice: Invoice) => void
}

export function EditInvoiceDialog({ open, onOpenChange, invoice, onSave }: EditInvoiceDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [nip, setNip] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentTerm, setPaymentTerm] = useState('30')
  const [hasPaymentTermRange, setHasPaymentTermRange] = useState(false)
  const [paymentTermStart, setPaymentTermStart] = useState('30')
  const [deadline, setDeadline] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [invoiceImages, setInvoiceImages] = useState<string[]>([])
  const [cargoImages, setCargoImages] = useState<string[]>([])
  const [nipError, setNipError] = useState('')
  const [loadingCity, setLoadingCity] = useState('')
  const [loadingAddress, setLoadingAddress] = useState('')
  const [unloadingCity, setUnloadingCity] = useState('')
  const [unloadingAddress, setUnloadingAddress] = useState('')
  const [calculatingDistance, setCalculatingDistance] = useState(false)

  useEffect(() => {
    if (invoice) {
      setCompanyName(invoice.companyName)
      setNip(invoice.nip)
      setAmount(invoice.amount.toString())
      setDescription(invoice.description || '')
      setPaymentTerm(invoice.paymentTerm.toString())
      setHasPaymentTermRange(invoice.paymentTermStart !== undefined)
      setPaymentTermStart(invoice.paymentTermStart?.toString() || '30')
      setDeadline(invoice.deadline)
      setIssueDate(invoice.issueDate || new Date().toISOString().split('T')[0])
      setContactPhone(invoice.contactPhone || '')
      setInvoiceImages(invoice.invoiceImages || [])
      setCargoImages(invoice.cargoImages || [])
      setLoadingCity(invoice.loadingLocation?.city || '')
      setLoadingAddress(invoice.loadingLocation?.address || '')
      setUnloadingCity(invoice.unloadingLocation?.city || '')
      setUnloadingAddress(invoice.unloadingLocation?.address || '')
      setNipError('')
    }
  }, [invoice])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'cargo') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Można dodać tylko pliki graficzne')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Plik jest za duży (max 5MB)')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (type === 'invoice') {
          setInvoiceImages(prev => [...prev, base64])
        } else {
          setCargoImages(prev => [...prev, base64])
        }
      }
      reader.readAsDataURL(file)
    })
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

    if (!invoice) return

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

    let distance: number | undefined = invoice.calculatedDistance
    let loadingLoc: Location | undefined = invoice.loadingLocation
    let unloadingLoc: Location | undefined = invoice.unloadingLocation

    if (loadingCity.trim() && unloadingCity.trim()) {
      const newLoadingLoc = {
        city: loadingCity.trim(),
        address: loadingAddress.trim() || '',
      }
      const newUnloadingLoc = {
        city: unloadingCity.trim(),
        address: unloadingAddress.trim() || '',
      }

      if (
        newLoadingLoc.city !== invoice.loadingLocation?.city ||
        newUnloadingLoc.city !== invoice.unloadingLocation?.city
      ) {
        setCalculatingDistance(true)
        try {
          distance = await calculateDistance(newLoadingLoc.city, newUnloadingLoc.city)
          if (distance > 0) {
            toast.success(`Obliczono dystans: ${distance} km`)
          }
        } catch (error) {
          toast.error('Nie udało się obliczyć dystansu')
        } finally {
          setCalculatingDistance(false)
        }
      }

      loadingLoc = newLoadingLoc
      unloadingLoc = newUnloadingLoc
    } else {
      loadingLoc = undefined
      unloadingLoc = undefined
      distance = undefined
    }

    const updatedInvoice: Invoice = {
      ...invoice,
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
    }

    onSave(updatedInvoice)
    onOpenChange(false)
    
    toast.success('Faktura została zaktualizowana', {
      description: `${companyName} - ${formatNIP(nip)}`,
    })
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PencilSimple size={24} weight="bold" className="text-primary" />
            Edytuj fakturę
          </DialogTitle>
          <DialogDescription>
            Zaktualizuj dane faktury i zapisz zmiany.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-company-name">Nazwa firmy</Label>
            <Input
              id="edit-company-name"
              placeholder="np. ABC Sp. z o.o."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-nip">NIP</Label>
            <Input
              id="edit-nip"
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
            <Label htmlFor="edit-amount">Kwota (PLN)</Label>
            <Input
              id="edit-amount"
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
            <Label htmlFor="edit-description">Opis (opcjonalnie)</Label>
            <Textarea
              id="edit-description"
              placeholder="Dodatkowe informacje o fakturze..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contact-phone" className="flex items-center gap-2">
              <Phone size={18} weight="duotone" />
              Numer telefonu kontaktowego (opcjonalnie)
            </Label>
            <Input
              id="edit-contact-phone"
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

          <div className="space-y-3 pt-2 border-t">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar size={18} weight="duotone" />
              Terminy
            </h3>

            <div className="space-y-2">
              <Label htmlFor="edit-issue-date">Data wystawienia faktury</Label>
              <Input
                id="edit-issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="edit-has-range"
                checked={hasPaymentTermRange}
                onCheckedChange={(checked) => setHasPaymentTermRange(checked === true)}
              />
              <Label htmlFor="edit-has-range" className="text-sm font-normal cursor-pointer">
                Termin płatności ma zakres (od - do)
              </Label>
            </div>

            {hasPaymentTermRange ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-payment-term-start">Termin od (dni)</Label>
                  <Select value={paymentTermStart} onValueChange={setPaymentTermStart}>
                    <SelectTrigger id="edit-payment-term-start">
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
                  <Label htmlFor="edit-payment-term">Termin do (dni)</Label>
                  <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                    <SelectTrigger id="edit-payment-term">
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
                <Label htmlFor="edit-payment-term">Termin płatności</Label>
                <Select value={paymentTerm} onValueChange={setPaymentTerm}>
                  <SelectTrigger id="edit-payment-term">
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
              <Label htmlFor="edit-deadline">Data ostateczna płatności</Label>
              <Input
                id="edit-deadline"
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
                <Label htmlFor="edit-loading-city">Miasto załadunku</Label>
                <Input
                  id="edit-loading-city"
                  placeholder="np. Warszawa"
                  value={loadingCity}
                  onChange={(e) => setLoadingCity(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-loading-address">Adres załadunku</Label>
                <Input
                  id="edit-loading-address"
                  placeholder="np. ul. Główna 1"
                  value={loadingAddress}
                  onChange={(e) => setLoadingAddress(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unloading-city">Miasto rozładunku</Label>
                <Input
                  id="edit-unloading-city"
                  placeholder="np. Kraków"
                  value={unloadingCity}
                  onChange={(e) => setUnloadingCity(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unloading-address">Adres rozładunku</Label>
                <Input
                  id="edit-unloading-address"
                  placeholder="np. ul. Rynek 5"
                  value={unloadingAddress}
                  onChange={(e) => setUnloadingAddress(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {loadingCity && unloadingCity && (
              <p className="text-sm text-muted-foreground">
                💡 Dystans zostanie automatycznie obliczony po zapisaniu zmian
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-invoice-images" className="flex items-center gap-2">
                <Image size={18} weight="duotone" />
                Zdjęcia faktury
              </Label>
              <Input
                id="edit-invoice-images"
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
              <Label htmlFor="edit-cargo-images" className="flex items-center gap-2">
                <Package size={18} weight="duotone" />
                Zdjęcia ładunku
              </Label>
              <Input
                id="edit-cargo-images"
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
              <PencilSimple className="mr-2" size={18} weight="bold" />
              {calculatingDistance ? 'Obliczanie...' : 'Zapisz zmiany'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
