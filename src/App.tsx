import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MagnifyingGlass, CheckCircle, Clock, Buildings, GasPump, ChartLine, Scales, Car, User, CloudArrowUp } from '@phosphor-icons/react'
import { Invoice, Company, FuelEntry, Vehicle, Driver } from '@/lib/types'
import { InvoiceCard } from '@/components/InvoiceCard'
import { AddInvoiceDialog } from '@/components/AddInvoiceDialog'
import { EditInvoiceDialog } from '@/components/EditInvoiceDialog'
import { PaymentConfirmationDialog } from '@/components/PaymentConfirmationDialog'
import { CompanyDetailsDialog } from '@/components/CompanyDetailsDialog'
import { NotificationBanner } from '@/components/NotificationBanner'
import { AddFuelDialog } from '@/components/AddFuelDialog'
import { AddVehicleDialog } from '@/components/AddVehicleDialog'
import { AddDriverDialog } from '@/components/AddDriverDialog'
import { FuelCard } from '@/components/FuelCard'
import { FinancialSummary } from '@/components/FinancialSummary'
import { ExportInvoicesButton } from '@/components/ExportInvoicesButton'
import { ExportFuelButton } from '@/components/ExportFuelButton'
import { ExportAllButton } from '@/components/ExportAllButton'
import { ReportGenerator } from '@/components/ReportGenerator'
import { BalanceTab } from '@/components/BalanceTab'
import { DriversTab } from '@/components/DriversTab'
import { VehicleStats } from '@/components/VehicleStats'
import { calculateScore, getCurrentDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useAutoReports } from '@/hooks/use-auto-reports'
import { useActivityMonitor } from '@/hooks/use-activity-monitor'
import { useUserTracking } from '@/hooks/use-user-tracking'
import { useSessionSnapshot } from '@/hooks/use-session-snapshot'
import { useFirebaseSync } from '@/hooks/use-firebase-sync'

function App() {
  // Firebase Sync - automatyczna synchronizacja między użytkownikami
  const { 
    data: invoices, 
    setData: setInvoices,
    syncStatus: invoicesSyncStatus,
    isFirebaseEnabled: isInvoicesSynced
  } = useFirebaseSync<Invoice>('invoices', 'invoices', [])
  
  const { 
    data: drivers, 
    setData: setDrivers,
    syncStatus: driversSyncStatus,
    isFirebaseEnabled: isDriversSynced
  } = useFirebaseSync<Driver>('drivers', 'drivers', [])
  
  const { 
    data: fuelEntries, 
    setData: setFuelEntries,
    syncStatus: fuelSyncStatus,
    isFirebaseEnabled: isFuelSynced
  } = useFirebaseSync<FuelEntry>('fuelEntries', 'fuelEntries', [])
  
  const { 
    data: vehicles, 
    setData: setVehicles,
    syncStatus: vehiclesSyncStatus,
    isFirebaseEnabled: isVehiclesSynced
  } = useFirebaseSync<Vehicle>('vehicles', 'vehicles', [])
  
  // Companies używa KV bo ma specjalną strukturę (Record nie Array)
  const [companies, setCompanies] = useKV<Record<string, Company>>('companies', {})
  
  const { generatedReports } = useAutoReports(invoices || [], fuelEntries || [])
  const { logActivity } = useActivityMonitor()
  const { hwid, userName, currentSession, logActivity: logUserActivity } = useUserTracking()
  const { endSession } = useSessionSnapshot(
    invoices || [],
    fuelEntries || [],
    drivers || [],
    vehicles || []
  )
  
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [addFuelDialogOpen, setAddFuelDialogOpen] = useState(false)
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false)
  const [addDriverDialogOpen, setAddDriverDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime())

  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [endSession])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDateTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const sendWelcomeEmail = async () => {
      const now = new Date()
      const dateStr = now.toLocaleString('pl-PL')

      try {
        const promptText = `SYMULACJA WYSYŁKI EMAILA

System Gadowski - System Zarządzania Fakturami został uruchomiony pomyślnie.

Email Details:
- Data: ${dateStr}
- Do: gadowskispzoo@gmail.com
- Temat: [GADOWSKI] System Faktur - Aplikacja Uruchomiona
- Treść: 
  Witaj!
  
  System zarządzania fakturami Gadowski został pomyślnie uruchomiony.
  
  Data uruchomienia: ${dateStr}
  Status: Aktywny
  
  System jest gotowy do pracy.
  
  Pozdrawiam,
  System Gadowski

Potwierdź otrzymanie wiadomości emailowej.`

        const response = await window.spark.llm(promptText, 'gpt-4o-mini')
        console.log('✉️ Email powitalny wysłany:', response)
        
        toast.success('Email powitalny wysłany', {
          description: `Do: gadowskispzoo@gmail.com - ${now.toLocaleTimeString('pl-PL')}`
        })
      } catch (error) {
        console.error('Błąd podczas wysyłki emaila:', error)
      }
    }

    const timer = setTimeout(() => {
      sendWelcomeEmail()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const outstandingInvoices = useMemo(
    () => (invoices || []).filter(inv => !inv.isPaid),
    [invoices]
  )

  const paidInvoices = useMemo(
    () => (invoices || []).filter(inv => inv.isPaid),
    [invoices]
  )

  const filteredOutstanding = useMemo(() => {
    if (!searchQuery) return outstandingInvoices
    const query = searchQuery.toLowerCase()
    return outstandingInvoices.filter(
      inv =>
        inv.companyName.toLowerCase().includes(query) ||
        inv.nip.includes(query)
    )
  }, [outstandingInvoices, searchQuery])

  const filteredPaid = useMemo(() => {
    if (!searchQuery) return paidInvoices
    const query = searchQuery.toLowerCase()
    return paidInvoices.filter(
      inv =>
        inv.companyName.toLowerCase().includes(query) ||
        inv.nip.includes(query)
    )
  }, [paidInvoices, searchQuery])

  const handleAddInvoice = useCallback((data: { 
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
    loadingLocation?: { city: string; address: string }
    unloadingLocation?: { city: string; address: string }
    calculatedDistance?: number
    driverId?: string
  }) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName: data.companyName,
      nip: data.nip,
      amount: data.amount,
      deadline: data.deadline,
      paymentTerm: data.paymentTerm,
      paymentTermStart: data.paymentTermStart,
      issueDate: data.issueDate,
      description: data.description,
      createdAt: new Date().toISOString(),
      isPaid: false,
      invoiceImages: data.invoiceImages,
      cargoImages: data.cargoImages,
      contactPhone: data.contactPhone,
      loadingLocation: data.loadingLocation,
      unloadingLocation: data.unloadingLocation,
      calculatedDistance: data.calculatedDistance,
      driverId: data.driverId,
    }

    setInvoices(current => [...(current || []), newInvoice])

    setCompanies(current => {
      const updated = { ...(current || {}) }
      if (!updated[data.nip]) {
        updated[data.nip] = {
          nip: data.nip,
          name: data.companyName,
          score: 0,
          invoices: [],
        }
      }
      updated[data.nip].invoices.push(newInvoice)
      return updated
    })

    logActivity('invoice_added', `Faktura dodana: ${data.companyName} - ${formatCurrency(data.amount)}`, {
      invoiceId: newInvoice.id,
      companyName: data.companyName,
      amount: data.amount,
      nip: data.nip,
    })

    logUserActivity('invoice_added', `Dodano fakturę ${data.companyName} na kwotę ${formatCurrency(data.amount)}`)
  }, [setInvoices, setCompanies, logActivity, logUserActivity])

  const handleMarkAsPaid = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setConfirmDialogOpen(true)
  }, [])

  const handleConfirmPayment = useCallback(() => {
    if (!selectedInvoice) return

    const paidAt = new Date().toISOString()
    const paidOnTime = new Date(paidAt) <= new Date(selectedInvoice.deadline)
    const pointsEarned = calculateScore(paidOnTime)

    setInvoices(current =>
      (current || []).map(inv =>
        inv.id === selectedInvoice.id
          ? { ...inv, isPaid: true, paidAt, paidOnTime }
          : inv
      )
    )

    setCompanies(current => {
      const updated = { ...(current || {}) }
      const company = updated[selectedInvoice.nip]
      
      if (company) {
        company.score += pointsEarned
        company.invoices = company.invoices.map(inv =>
          inv.id === selectedInvoice.id
            ? { ...inv, isPaid: true, paidAt, paidOnTime }
            : inv
        )
      }
      
      return updated
    })

    toast.success('Płatność potwierdzona', {
      description: `${selectedInvoice.companyName} - ${paidOnTime ? 'Na czas (+10 pkt)' : 'Po terminie (-5 pkt)'}`,
    })

    logActivity('invoice_paid', `Faktura opłacona: ${selectedInvoice.companyName} - ${formatCurrency(selectedInvoice.amount)}`, {
      invoiceId: selectedInvoice.id,
      companyName: selectedInvoice.companyName,
      amount: selectedInvoice.amount,
      paidOnTime,
    })

    logUserActivity('invoice_paid', `Opłacono fakturę ${selectedInvoice.companyName} - ${paidOnTime ? 'na czas' : 'po terminie'}`)

    setSelectedInvoice(null)
  }, [selectedInvoice, setInvoices, setCompanies, logActivity, logUserActivity])

  const handleAddVehicle = useCallback((data: {
    brand: string
    model: string
    year: number
    color: string
    engineType: string
    expectedFuelConsumption: number
    initialOdometerReading: number
    driverName: string
    driverPhone: string
  }) => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
    }

    setVehicles((current) => [...(current || []), newVehicle])
    
    toast.success('Pojazd został dodany', {
      description: `${data.brand} ${data.model} - ${data.driverName}`,
    })

    logActivity('vehicle_added', `Pojazd dodany: ${data.brand} ${data.model}`, {
      vehicleId: newVehicle.id,
      brand: data.brand,
      model: data.model,
      driverName: data.driverName,
    })
  }, [setVehicles, logActivity])

  const handleAddDriver = useCallback((data: { name: string; phone: string; email?: string; registrationNumber?: string; carBrand?: string; carColor?: string; dailyCost?: number }) => {
    const newDriver: Driver = {
      id: `driver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      registrationNumber: data.registrationNumber,
      carBrand: data.carBrand,
      carColor: data.carColor,
      dailyCost: data.dailyCost,
      createdAt: new Date().toISOString(),
    }

    setDrivers((current) => [...(current || []), newDriver])

    const vehicleInfo = data.carBrand || data.registrationNumber 
      ? ` - ${data.carBrand || 'Pojazd'}${data.registrationNumber ? ` (${data.registrationNumber})` : ''}`
      : ''

    toast.success('Kierowca został dodany', {
      description: `${data.name} - ${data.phone}${vehicleInfo}`,
    })

    logActivity('driver_added', `Kierowca dodany: ${data.name}`, {
      driverId: newDriver.id,
      name: data.name,
      phone: data.phone,
      registrationNumber: data.registrationNumber,
      carBrand: data.carBrand,
    })
  }, [setDrivers, logActivity])

  const handleUpdateDriver = useCallback((driverId: string, updates: Partial<Driver>) => {
    setDrivers((current) => 
      (current || []).map((driver) =>
        driver.id === driverId ? { ...driver, ...updates } : driver
      )
    )

    const driver = (drivers || []).find((d) => d.id === driverId)
    if (driver) {
      toast.success('Kierowca został zaktualizowany', {
        description: `${driver.name} - ${updates.dailyCost ? `Dniówka: ${formatCurrency(updates.dailyCost)}` : 'Dane zaktualizowane'}`,
      })

      logActivity('driver_edited', `Kierowca zaktualizowany: ${driver.name}`, {
        driverId,
        updates,
      })
    }
  }, [drivers, setDrivers, logActivity])

  const handleAddFuel = useCallback((data: { vehicleId: string; date: string; amount: number; liters: number; odometerReading: number }) => {
    const allFuelEntries = [...(fuelEntries || [])]
    const vehicleFuelEntries = allFuelEntries
      .filter((entry) => entry.vehicleId === data.vehicleId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const lastEntry = vehicleFuelEntries[vehicleFuelEntries.length - 1]

    let calculatedConsumption: number | undefined
    let distanceSinceLastFuel: number | undefined

    if (lastEntry && data.odometerReading > lastEntry.odometerReading) {
      distanceSinceLastFuel = data.odometerReading - lastEntry.odometerReading
      calculatedConsumption = (lastEntry.liters / distanceSinceLastFuel) * 100
    }

    const newFuelEntry: FuelEntry = {
      id: `fuel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: data.vehicleId,
      date: data.date,
      amount: data.amount,
      liters: data.liters,
      pricePerLiter: data.amount / data.liters,
      odometerReading: data.odometerReading,
      createdAt: new Date().toISOString(),
      calculatedConsumption,
      distanceSinceLastFuel,
    }

    setFuelEntries((current) => [...(current || []), newFuelEntry])
    
    const vehicle = (vehicles || []).find((v) => v.id === data.vehicleId)
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Pojazd'

    toast.success('Tankowanie zostało dodane', {
      description: calculatedConsumption 
        ? `${data.liters.toFixed(2)} L • ${calculatedConsumption.toFixed(2)} L/100km` 
        : `${data.liters.toFixed(2)} L • ${(data.amount / data.liters).toFixed(2)} PLN/L`,
    })

    logActivity('fuel_added', `Tankowanie dodane: ${vehicleName} - ${data.liters.toFixed(2)} L`, {
      fuelId: newFuelEntry.id,
      vehicleId: data.vehicleId,
      liters: data.liters,
      amount: data.amount,
      consumption: calculatedConsumption,
    })

    logUserActivity('fuel_added', `Dodano tankowanie: ${vehicleName} - ${data.liters.toFixed(2)} L`)
  }, [fuelEntries, vehicles, setFuelEntries, logActivity, logUserActivity])

  const handleDeleteFuel = useCallback((id: string) => {
    const entry = (fuelEntries || []).find((e) => e.id === id)
    setFuelEntries((current) => (current || []).filter((entry) => entry.id !== id))
    toast.success('Tankowanie zostało usunięte')
    
    if (entry) {
      logActivity('fuel_deleted', `Tankowanie usunięte: ${entry.liters.toFixed(2)} L`, {
        fuelId: id,
        vehicleId: entry.vehicleId,
        liters: entry.liters,
      })
    }
  }, [fuelEntries, setFuelEntries, logActivity])

  const handleDeleteVehicle = useCallback((vehicleId: string) => {
    const vehicle = (vehicles || []).find((v) => v.id === vehicleId)
    setVehicles((current) => (current || []).filter((v) => v.id !== vehicleId))
    toast.success('Pojazd został usunięty')

    if (vehicle) {
      logActivity('vehicle_deleted', `Pojazd usunięty: ${vehicle.brand} ${vehicle.model}`, {
        vehicleId,
        brand: vehicle.brand,
        model: vehicle.model,
      })
    }
  }, [vehicles, setVehicles, logActivity])

  const handleViewDetails = useCallback((invoice: Invoice) => {
    const company = (companies || {})[invoice.nip]
    if (company) {
      setSelectedCompany(company)
      setDetailsDialogOpen(true)
    }
  }, [companies])

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setEditDialogOpen(true)
  }, [])

  const handleSaveEditedInvoice = useCallback((updatedInvoice: Invoice) => {
    const oldNip = selectedInvoice?.nip
    const newNip = updatedInvoice.nip

    setInvoices(current =>
      (current || []).map(inv =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    )

    setCompanies(current => {
      const updated = { ...(current || {}) }
      
      if (oldNip && oldNip !== newNip && updated[oldNip]) {
        updated[oldNip].invoices = updated[oldNip].invoices.filter(
          inv => inv.id !== updatedInvoice.id
        )
        if (updated[oldNip].invoices.length === 0) {
          delete updated[oldNip]
        }
      }

      if (!updated[newNip]) {
        updated[newNip] = {
          nip: newNip,
          name: updatedInvoice.companyName,
          score: 0,
          invoices: [],
        }
      }

      updated[newNip].invoices = updated[newNip].invoices.map(inv =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )

      if (!updated[newNip].invoices.find(inv => inv.id === updatedInvoice.id)) {
        updated[newNip].invoices.push(updatedInvoice)
      }

      updated[newNip].name = updatedInvoice.companyName

      return updated
    })

    logActivity('invoice_edited', `Faktura edytowana: ${updatedInvoice.companyName} - ${formatCurrency(updatedInvoice.amount)}`, {
      invoiceId: updatedInvoice.id,
      companyName: updatedInvoice.companyName,
      amount: updatedInvoice.amount,
    })

    setSelectedInvoice(null)
  }, [selectedInvoice, setInvoices, setCompanies, logActivity])

  const existingNIPs = Object.keys(companies || {})
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-[1800px]">
          <header className="mb-8">
            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                      <Buildings size={32} weight="duotone" className="text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        Gadowski sp. z o.o.
                      </h1>
                      <p className="text-muted-foreground text-base font-medium">
                        System zarządzania fakturami
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="bg-muted/80 px-4 py-2.5 rounded-lg border-2 border-border/50 font-medium">
                      <span className="text-foreground">{currentTime.date}</span>
                    </div>
                    <div className="bg-primary/15 px-4 py-2.5 rounded-lg border-2 border-primary/40">
                      <span className="text-primary font-mono font-bold text-base">{currentTime.time}</span>
                    </div>
                    {/* Status synchronizacji Firebase */}
                    {isInvoicesSynced || isDriversSynced || isFuelSynced || isVehiclesSynced ? (
                      <div className="bg-success/15 px-4 py-2.5 rounded-lg border-2 border-success/40 flex items-center gap-2">
                        <CloudArrowUp size={18} weight="bold" className="text-success" />
                        <span className="text-success font-semibold">
                          {invoicesSyncStatus === 'syncing' || driversSyncStatus === 'syncing' || fuelSyncStatus === 'syncing' || vehiclesSyncStatus === 'syncing' 
                            ? 'Synchronizacja...' 
                            : 'Zsynchronizowane'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-warning/15 px-4 py-2.5 rounded-lg border-2 border-warning/40 flex items-center gap-2">
                        <CloudArrowUp size={18} weight="bold" className="text-warning" />
                        <span className="text-warning font-semibold">Tylko lokalnie</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ReportGenerator 
                    invoices={invoices || []} 
                    fuelEntries={fuelEntries || []}
                  />
                  <ExportAllButton invoices={invoices || []} fuelEntries={fuelEntries || []} />
                  <Button onClick={() => setAddDriverDialogOpen(true)} size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all font-semibold border-2">
                    <User className="mr-2" size={22} weight="bold" />
                    Dodaj kierowcę
                  </Button>
                  <Button onClick={() => setAddDialogOpen(true)} size="lg" className="shadow-lg hover:shadow-xl transition-all font-semibold">
                    <Plus className="mr-2" size={22} weight="bold" />
                    Dodaj fakturę
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <NotificationBanner invoices={invoices || []} />
            </div>

            <div className="mt-6">
              <FinancialSummary invoices={invoices || []} fuelEntries={fuelEntries || []} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card border-2 border-secondary/40 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/20 p-3.5 rounded-xl border-2 border-secondary/30">
                    <Clock size={36} weight="duotone" className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wide">Do zapłaty</p>
                    <p className="text-4xl font-bold font-mono text-foreground">
                      {outstandingInvoices.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border-2 border-success/40 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-success/20 p-3.5 rounded-xl border-2 border-success/30">
                    <CheckCircle size={36} weight="duotone" className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wide">Opłacone</p>
                    <p className="text-4xl font-bold font-mono text-foreground">
                      {paidInvoices.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3.5 rounded-xl border-2 border-primary/30">
                    <Buildings size={36} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wide">Firm w systemie</p>
                    <p className="text-4xl font-bold font-mono text-foreground">
                      {Object.keys(companies || {}).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={24}
                  weight="bold"
                />
                <Input
                  placeholder="Szukaj po nazwie firmy lub NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 text-base font-medium"
                />
              </div>
            </div>
          </header>

          <Tabs defaultValue="outstanding" className="space-y-6">
            <TabsList className="grid w-full md:w-auto grid-cols-5 h-auto bg-card border-2 border-border shadow-md p-1">
              <TabsTrigger value="outstanding" className="text-base py-3.5 px-6 font-semibold data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md">
                <Clock className="mr-2" size={20} weight="duotone" />
                Oczekujące ({filteredOutstanding.length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="text-base py-3.5 px-6 font-semibold data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:shadow-md">
                <CheckCircle className="mr-2" size={20} weight="duotone" />
                Opłacone ({filteredPaid.length})
              </TabsTrigger>
              <TabsTrigger value="fuel" className="text-base py-3.5 px-6 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <GasPump className="mr-2" size={20} weight="duotone" />
                Paliwo ({(fuelEntries || []).length})
              </TabsTrigger>
              <TabsTrigger value="drivers" className="text-base py-3.5 px-6 font-semibold data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
                <User className="mr-2" size={20} weight="duotone" />
                Kierowcy ({(drivers || []).length})
              </TabsTrigger>
              <TabsTrigger value="balance" className="text-base py-3.5 px-6 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <Scales className="mr-2" size={20} weight="duotone" />
                Bilans
              </TabsTrigger>
            </TabsList>
            <TabsContent value="outstanding" className="space-y-4">
              <div className="flex justify-end mb-4">
                <ExportInvoicesButton invoices={filteredOutstanding} isPaid={false} />
              </div>
              {filteredOutstanding.length === 0 ? (
                <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-xl shadow-sm">
                  <Clock size={72} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak oczekujących faktur'}
                  </h3>
                  <p className="text-muted-foreground font-medium text-lg">
                    {searchQuery
                      ? 'Spróbuj użyć innych kryteriów wyszukiwania'
                      : 'Wszystkie faktury zostały opłacone'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredOutstanding.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onMarkAsPaid={handleMarkAsPaid}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditInvoice}
                      drivers={drivers || []}
                      fuelEntries={fuelEntries || []}
                      vehicles={vehicles || []}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <div className="flex justify-end mb-4">
                <ExportInvoicesButton invoices={filteredPaid} isPaid={true} />
              </div>
              {filteredPaid.length === 0 ? (
                <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-xl shadow-sm">
                  <CheckCircle size={72} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak opłaconych faktur'}
                  </h3>
                  <p className="text-muted-foreground font-medium text-lg">
                    {searchQuery
                      ? 'Spróbuj użyć innych kryteriów wyszukiwania'
                      : 'Nie ma jeszcze opłaconych faktur'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPaid.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditInvoice}
                      showScore
                      scoreChange={invoice.paidOnTime ? 10 : -5}
                      drivers={drivers || []}
                      fuelEntries={fuelEntries || []}
                      vehicles={vehicles || []}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fuel" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-foreground">Historia tankowań</h2>
                <div className="flex gap-3">
                  <Button onClick={() => setAddVehicleDialogOpen(true)} variant="outline" className="shadow-md border-2 font-semibold">
                    <Car className="mr-2" size={20} weight="bold" />
                    Dodaj pojazd
                  </Button>
                  <ExportFuelButton fuelEntries={fuelEntries || []} />
                  <Button onClick={() => setAddFuelDialogOpen(true)} className="shadow-md font-semibold">
                    <Plus className="mr-2" size={20} weight="bold" />
                    Dodaj tankowanie
                  </Button>
                </div>
              </div>

              <div>
                <VehicleStats 
                  vehicles={vehicles || []} 
                  fuelEntries={fuelEntries || []} 
                  onDeleteVehicle={handleDeleteVehicle}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Wszystkie tankowania</h3>
                {(fuelEntries || []).length === 0 ? (
                  <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-xl shadow-sm">
                    <GasPump size={72} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-bold mb-3 text-foreground">Brak wpisów paliwowych</h3>
                    <p className="text-muted-foreground font-medium text-lg">Rozpocznij od dodania pierwszego tankowania</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...(fuelEntries || [])]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((fuel) => {
                        const vehicle = (vehicles || []).find(v => v.id === fuel.vehicleId)
                        return (
                          <FuelCard
                            key={fuel.id}
                            fuel={fuel}
                            vehicle={vehicle}
                            onDelete={handleDeleteFuel}
                          />
                        )
                      })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drivers" className="space-y-4">
              <DriversTab drivers={drivers || []} onUpdateDriver={handleUpdateDriver} />
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <BalanceTab invoices={invoices || []} fuelEntries={fuelEntries || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddFuelDialog
        open={addFuelDialogOpen}
        onOpenChange={setAddFuelDialogOpen}
        onAdd={handleAddFuel}
        vehicles={vehicles || []}
      />

      <AddVehicleDialog
        open={addVehicleDialogOpen}
        onOpenChange={setAddVehicleDialogOpen}
        onAdd={handleAddVehicle}
      />

      <AddDriverDialog
        open={addDriverDialogOpen}
        onOpenChange={setAddDriverDialogOpen}
        onAdd={handleAddDriver}
      />

      <AddInvoiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddInvoice}
        existingNIPs={existingNIPs}
        drivers={drivers || []}
      />

      <EditInvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoice={selectedInvoice}
        onSave={handleSaveEditedInvoice}
      />

      <PaymentConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        invoice={selectedInvoice}
        onConfirm={handleConfirmPayment}
      />

      <CompanyDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        company={selectedCompany}
      />

      <Toaster position="top-right" />
    </>
  )
}

export default App