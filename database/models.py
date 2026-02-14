"""
Database models matching React TypeScript interfaces
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, List
import uuid


@dataclass
class Invoice:
    """Invoice model - matches TypeScript Invoice interface"""
    id: str = field(default_factory=lambda: f"inv-{uuid.uuid4().hex[:12]}")
    company_name: str = ""
    nip: str = ""
    amount: float = 0.0
    deadline: str = ""  # ISO date string
    payment_term: int = 0
    payment_term_start: Optional[int] = None
    issue_date: str = ""  # ISO date string
    description: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    is_paid: bool = False
    paid_at: Optional[str] = None
    paid_on_time: Optional[bool] = None
    invoice_images: Optional[str] = None  # Base64 encoded
    cargo_images: Optional[str] = None  # Base64 encoded
    contact_phone: Optional[str] = None
    loading_location: Optional[dict] = None  # {city: str, address: str}
    unloading_location: Optional[dict] = None
    calculated_distance: Optional[float] = None
    driver_id: Optional[str] = None

    def to_dict(self):
        return asdict(self)


@dataclass
class Driver:
    """Driver model"""
    id: str = field(default_factory=lambda: f"driver-{uuid.uuid4().hex[:12]}")
    name: str = ""
    phone: str = ""
    email: Optional[str] = None
    registration_number: Optional[str] = None
    car_brand: Optional[str] = None
    car_color: Optional[str] = None
    daily_cost: Optional[float] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self):
        return asdict(self)


@dataclass
class FuelEntry:
    """Fuel entry model"""
    id: str = field(default_factory=lambda: f"fuel-{uuid.uuid4().hex[:12]}")
    date: str = ""  # ISO date string
    amount: float = 0.0
    liters: float = 0.0
    station: str = ""
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self):
        return asdict(self)


@dataclass
class Vehicle:
    """Vehicle model"""
    id: str = field(default_factory=lambda: f"vehicle-{uuid.uuid4().hex[:12]}")
    brand: str = ""
    model: str = ""
    year: int = 2020
    color: str = ""
    engine_type: str = ""
    expected_fuel_consumption: float = 0.0
    initial_odometer_reading: float = 0.0
    driver_name: str = ""
    driver_phone: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self):
        return asdict(self)


@dataclass  
class Company:
    """Company model for scoring"""
    nip: str = ""
    name: str = ""
    score: int = 0
    invoices: List[str] = field(default_factory=list)  # List of invoice IDs

    def to_dict(self):
        return asdict(self)
