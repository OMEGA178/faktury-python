"""
Database handler using TinyDB (JSON-based, similar to Firebase)
"""

from tinydb import TinyDB, Query
from tinydb.operations import set as db_set
from pathlib import Path
from typing import List, Optional, Dict, Any
import config
from database.models import Invoice, Driver, FuelEntry, Vehicle, Company


class Database:
    """Database handler for all data operations"""
    
    def __init__(self, db_path: Path = config.DB_PATH):
        self.db = TinyDB(db_path)
        self.invoices = self.db.table('invoices')
        self.drivers = self.db.table('drivers')
        self.fuel_entries = self.db.table('fuel_entries')
        self.vehicles = self.db.table('vehicles')
        self.companies = self.db.table('companies')
        
    # INVOICES
    def add_invoice(self, invoice: Invoice) -> str:
        """Add new invoice"""
        self.invoices.insert(invoice.to_dict())
        return invoice.id
    
    def get_invoices(self) -> List[Dict]:
        """Get all invoices"""
        return self.invoices.all()
    
    def get_invoice(self, invoice_id: str) -> Optional[Dict]:
        """Get invoice by ID"""
        Query_ = Query()
        result = self.invoices.search(Query_.id == invoice_id)
        return result[0] if result else None
    
    def update_invoice(self, invoice_id: str, data: Dict) -> bool:
        """Update invoice"""
        Query_ = Query()
        return self.invoices.update(data, Query_.id == invoice_id)
    
    def delete_invoice(self, invoice_id: str) -> bool:
        """Delete invoice"""
        Query_ = Query()
        return self.invoices.remove(Query_.id == invoice_id)
    
    def mark_as_paid(self, invoice_id: str, paid_at: str, paid_on_time: bool) -> bool:
        """Mark invoice as paid"""
        Query_ = Query()
        return self.invoices.update({
            'is_paid': True,
            'paid_at': paid_at,
            'paid_on_time': paid_on_time
        }, Query_.id == invoice_id)
    
    # DRIVERS
    def add_driver(self, driver: Driver) -> str:
        """Add new driver"""
        self.drivers.insert(driver.to_dict())
        return driver.id
    
    def get_drivers(self) -> List[Dict]:
        """Get all drivers"""
        return self.drivers.all()
    
    def get_driver(self, driver_id: str) -> Optional[Dict]:
        """Get driver by ID"""
        Query_ = Query()
        result = self.drivers.search(Query_.id == driver_id)
        return result[0] if result else None
    
    def update_driver(self, driver_id: str, data: Dict) -> bool:
        """Update driver"""
        Query_ = Query()
        return self.drivers.update(data, Query_.id == driver_id)
    
    def delete_driver(self, driver_id: str) -> bool:
        """Delete driver"""
        Query_ = Query()
        return self.drivers.remove(Query_.id == driver_id)
    
    # FUEL ENTRIES
    def add_fuel_entry(self, fuel: FuelEntry) -> str:
        """Add new fuel entry"""
        self.fuel_entries.insert(fuel.to_dict())
        return fuel.id
    
    def get_fuel_entries(self) -> List[Dict]:
        """Get all fuel entries"""
        return self.fuel_entries.all()
    
    def delete_fuel_entry(self, fuel_id: str) -> bool:
        """Delete fuel entry"""
        Query_ = Query()
        return self.fuel_entries.remove(Query_.id == fuel_id)
    
    # VEHICLES
    def add_vehicle(self, vehicle: Vehicle) -> str:
        """Add new vehicle"""
        self.vehicles.insert(vehicle.to_dict())
        return vehicle.id
    
    def get_vehicles(self) -> List[Dict]:
        """Get all vehicles"""
        return self.vehicles.all()
    
    def delete_vehicle(self, vehicle_id: str) -> bool:
        """Delete vehicle"""
        Query_ = Query()
        return self.vehicles.remove(Query_.id == vehicle_id)
    
    # COMPANIES
    def get_or_create_company(self, nip: str, name: str) -> Dict:
        """Get or create company by NIP"""
        Query_ = Query()
        result = self.companies.search(Query_.nip == nip)
        if result:
            return result[0]
        else:
            company = Company(nip=nip, name=name)
            self.companies.insert(company.to_dict())
            return company.to_dict()
    
    def update_company_score(self, nip: str, score_delta: int) -> bool:
        """Update company score"""
        Query_ = Query()
        company = self.companies.search(Query_.nip == nip)
        if company:
            new_score = company[0].get('score', 0) + score_delta
            return self.companies.update({'score': new_score}, Query_.nip == nip)
        return False
    
    def close(self):
        """Close database"""
        self.db.close()
