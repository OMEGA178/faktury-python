"""
Add Fuel Entry Dialog
"""

import customtkinter as ctk
from datetime import datetime
from tkinter import messagebox
from typing import Callable, List

from config import COLORS
from database.models import FuelEntry, Driver, Vehicle


class AddFuelDialog(ctk.CTkToplevel):
    """Dialog for adding a new fuel entry"""
    
    def __init__(self, parent, drivers: List[dict], vehicles: List[dict], on_save: Callable[[FuelEntry], None]):
        super().__init__(parent)
        
        self.on_save = on_save
        self.drivers = drivers
        self.vehicles = vehicles
        
        # Configure window
        self.title("Dodaj Tankowanie")
        self.geometry("600x750")
        self.resizable(False, False)
        
        # Make modal
        self.transient(parent)
        self.grab_set()
        
        # Center window
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
        
        self.setup_ui()
    
    def setup_ui(self):
        """Create dialog UI"""
        # Main container
        main_frame = ctk.CTkFrame(self, fg_color=COLORS["background"])
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Title
        title = ctk.CTkLabel(
            main_frame,
            text="⛽ Nowe Tankowanie",
            font=("Segoe UI", 24, "bold"),
            text_color=COLORS["text_primary"]
        )
        title.pack(pady=(0, 20))
        
        # Form container
        form = ctk.CTkFrame(main_frame, fg_color=COLORS["card"], corner_radius=8)
        form.pack(fill="both", expand=True)
        
        # Fuel Info Section
        section_title = ctk.CTkLabel(
            form,
            text="Informacje o Tankowaniu",
            font=("Segoe UI", 16, "bold"),
            text_color=COLORS["accent"]
        )
        section_title.pack(anchor="w", padx=15, pady=(15, 10))
        
        # Date *
        self.create_field(form, "Data *", "date")
        self.entry_date.insert(0, datetime.now().strftime("%Y-%m-%d"))
        
        # Amount *
        self.create_field(form, "Kwota (PLN) *", "amount")
        
        # Liters *
        self.create_field(form, "Litry *", "liters")
        
        # Station *
        self.create_field(form, "Stacja Paliw *", "station")
        
        # Driver dropdown
        driver_container = ctk.CTkFrame(form, fg_color="transparent")
        driver_container.pack(fill="x", padx=15, pady=5)
        
        ctk.CTkLabel(
            driver_container,
            text="Kierowca",
            font=("Segoe UI", 12),
            text_color=COLORS["text_secondary"],
            anchor="w"
        ).pack(anchor="w", pady=(0, 5))
        
        driver_names = ["Brak"] + [d.get('name', 'N/A') for d in self.drivers]
        self.driver_dropdown = ctk.CTkOptionMenu(
            driver_container,
            values=driver_names,
            fg_color=COLORS["input_bg"],
            button_color=COLORS["accent"],
            button_hover_color=COLORS["accent_hover"],
            dropdown_fg_color=COLORS["card"],
            height=36
        )
        self.driver_dropdown.pack(fill="x")
        
        # Vehicle dropdown
        vehicle_container = ctk.CTkFrame(form, fg_color="transparent")
        vehicle_container.pack(fill="x", padx=15, pady=5)
        
        ctk.CTkLabel(
            vehicle_container,
            text="Pojazd",
            font=("Segoe UI", 12),
            text_color=COLORS["text_secondary"],
            anchor="w"
        ).pack(anchor="w", pady=(0, 5))
        
        vehicle_names = ["Brak"] + [f"{v.get('brand', '')} {v.get('model', '')}" for v in self.vehicles]
        self.vehicle_dropdown = ctk.CTkOptionMenu(
            vehicle_container,
            values=vehicle_names,
            fg_color=COLORS["input_bg"],
            button_color=COLORS["accent"],
            button_hover_color=COLORS["accent_hover"],
            dropdown_fg_color=COLORS["card"],
            height=36
        )
        self.vehicle_dropdown.pack(fill="x")
        
        # Notes
        notes_container = ctk.CTkFrame(form, fg_color="transparent")
        notes_container.pack(fill="x", padx=15, pady=5)
        
        ctk.CTkLabel(
            notes_container,
            text="Notatki",
            font=("Segoe UI", 12),
            text_color=COLORS["text_secondary"],
            anchor="w"
        ).pack(anchor="w", pady=(0, 5))
        
        self.notes_textbox = ctk.CTkTextbox(
            notes_container,
            height=80,
            fg_color=COLORS["input_bg"],
            border_color=COLORS["border"],
            border_width=1,
            text_color=COLORS["text_primary"]
        )
        self.notes_textbox.pack(fill="x")
        
        # Buttons
        self.create_buttons(main_frame)
    
    def create_field(self, parent, label: str, field_name: str):
        """Create a single form field"""
        container = ctk.CTkFrame(parent, fg_color="transparent")
        container.pack(fill="x", padx=15, pady=5)
        
        lbl = ctk.CTkLabel(
            container,
            text=label,
            font=("Segoe UI", 12),
            text_color=COLORS["text_secondary"],
            anchor="w"
        )
        lbl.pack(anchor="w", pady=(0, 5))
        
        entry = ctk.CTkEntry(
            container,
            height=36,
            fg_color=COLORS["input_bg"],
            border_color=COLORS["border"],
            border_width=1,
            text_color=COLORS["text_primary"]
        )
        entry.pack(fill="x")
        
        setattr(self, f"entry_{field_name}", entry)
    
    def create_buttons(self, parent):
        """Create action buttons"""
        btn_frame = ctk.CTkFrame(parent, fg_color="transparent")
        btn_frame.pack(fill="x", pady=(20, 0))
        
        cancel_btn = ctk.CTkButton(
            btn_frame,
            text="Anuluj",
            command=self.destroy,
            fg_color="transparent",
            border_width=1,
            border_color=COLORS["border"],
            text_color=COLORS["text_secondary"],
            hover_color=COLORS["hover"],
            height=40
        )
        cancel_btn.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        save_btn = ctk.CTkButton(
            btn_frame,
            text="Dodaj Tankowanie",
            command=self.save_fuel,
            fg_color=COLORS["success"],
            hover_color="#66BB6A",
            height=40,
            font=("Segoe UI", 13, "bold")
        )
        save_btn.pack(side="right", fill="x", expand=True, padx=(5, 0))
    
    def get_entry_value(self, field_name: str) -> str:
        """Get value from entry field"""
        entry = getattr(self, f"entry_{field_name}", None)
        if entry is None:
            return ""
        return entry.get().strip()
    
    def save_fuel(self):
        """Validate and save fuel entry"""
        # Get values
        date_str = self.get_entry_value("date")
        amount_str = self.get_entry_value("amount")
        liters_str = self.get_entry_value("liters")
        station = self.get_entry_value("station")
        
        # Validate required
        if not date_str:
            messagebox.showerror("Błąd", "Data jest wymagana")
            return
        if not amount_str:
            messagebox.showerror("Błąd", "Kwota jest wymagana")
            return
        if not liters_str:
            messagebox.showerror("Błąd", "Liczba litrów jest wymagana")
            return
        if not station:
            messagebox.showerror("Błąd", "Stacja paliw jest wymagana")
            return
        
        # Validate date
        try:
            fuel_date = datetime.strptime(date_str, "%Y-%m-%d")
        except:
            messagebox.showerror("Błąd", "Nieprawidłowy format daty (YYYY-MM-DD)")
            return
        
        # Validate numbers
        try:
            amount = float(amount_str)
            if amount <= 0:
                raise ValueError()
        except:
            messagebox.showerror("Błąd", "Kwota musi być liczbą większą od 0")
            return
        
        try:
            liters = float(liters_str)
            if liters <= 0:
                raise ValueError()
        except:
            messagebox.showerror("Błąd", "Litry muszą być liczbą większą od 0")
            return
        
        # Get driver and vehicle
        driver_name = self.driver_dropdown.get()
        driver_id = None
        if driver_name != "Brak":
            for driver in self.drivers:
                if driver.get('name') == driver_name:
                    driver_id = driver.get('id')
                    break
        
        vehicle_name = self.vehicle_dropdown.get()
        vehicle_id = None
        if vehicle_name != "Brak":
            for vehicle in self.vehicles:
                if f"{vehicle.get('brand', '')} {vehicle.get('model', '')}" == vehicle_name:
                    vehicle_id = vehicle.get('id')
                    break
        
        # Get notes
        notes = self.notes_textbox.get("1.0", "end-1c").strip() or None
        
        # Create fuel entry
        fuel_entry = FuelEntry(
            date=fuel_date.isoformat(),
            amount=amount,
            liters=liters,
            station=station,
            driver_id=driver_id,
            vehicle_id=vehicle_id,
            notes=notes
        )
        
        # Call callback
        self.on_save(fuel_entry)
        
        # Close dialog
        self.destroy()
