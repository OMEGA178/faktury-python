export interface Location {
  city: string
  address: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  email?: string
  registrationNumber?: string
  carBrand?: string
  carColor?: string
  dailyCost?: number
  createdAt: string
}

export interface Invoice {
  id: string
  companyName: string
  nip: string
  amount: number
  deadline: string
  paymentTerm: number
  paymentTermStart?: number
  issueDate?: string
  description?: string
  createdAt: string
  paidAt?: string
  isPaid: boolean
  paidOnTime?: boolean
  invoiceImages?: string[]
  cargoImages?: string[]
  contactPhone?: string
  loadingLocation?: Location
  unloadingLocation?: Location
  calculatedDistance?: number
  driverId?: string
}

export interface Company {
  nip: string
  name: string
  score: number
  invoices: Invoice[]
}

export interface PaymentHistory {
  invoiceId: string
  amount: number
  deadline: string
  paidAt: string
  onTime: boolean
  pointsEarned: number
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  engineType: string
  expectedFuelConsumption: number
  initialOdometerReading: number
  driverName: string
  driverPhone: string
  createdAt: string
}

export interface FuelEntry {
  id: string
  vehicleId: string
  date: string
  amount: number
  liters: number
  pricePerLiter: number
  odometerReading: number
  createdAt: string
  calculatedConsumption?: number
  distanceSinceLastFuel?: number
}

export interface Report {
  id: string
  type: 'weekly' | 'monthly' | 'quarterly'
  startDate: string
  endDate: string
  generatedAt: string
  totalRevenue: number
  totalFuelCost: number
  netProfit: number
  invoicesCount: number
  fuelEntriesCount: number
  avgFuelPrice: number
  totalKilometers: number
}

export interface BusinessMetrics {
  breakEvenAmount: number
  monthlyTargetRevenue: number
  operationalCosts: number
  profitMarginTarget: number
  avgFuelPriceTarget: number
}

export type ActivityType = 
  | 'invoice_added'
  | 'invoice_edited'
  | 'invoice_paid'
  | 'invoice_deleted'
  | 'fuel_added'
  | 'fuel_deleted'
  | 'vehicle_added'
  | 'vehicle_edited'
  | 'vehicle_deleted'
  | 'driver_added'
  | 'driver_edited'
  | 'driver_deleted'
  | 'report_generated'

export interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  timestamp: string
  details?: Record<string, any>
}
