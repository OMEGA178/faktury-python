"""
Add Driver Dialog
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Callable

from config import COLORS
from database.models import Driver


class AddDriverDialog(ctk.CTkToplevel):
    """Dialog for adding a new driver"""
    
    def __init__(self, parent, on_save: Callable[[Driver], None]):
        super().__init__(parent)
        
        self.on_save = on_save
        
        # Configure window
        self.title("Dodaj Kierowcę")
        self.geometry("600x700")
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
            text="🚛 Nowy Kierowca",
            font=("Segoe UI", 24, "bold"),
            text_color=COLORS["text_primary"]
        )
        title.pack(pady=(0, 20))
        
        # Form container
        form = ctk.CTkFrame(main_frame, fg_color=COLORS["card"], corner_radius=8)
        form.pack(fill="both", expand=True)
        
        # Personal Info Section
        section_title = ctk.CTkLabel(
            form,
            text="Dane Osobowe",
            font=("Segoe UI", 16, "bold"),
            text_color=COLORS["accent"]
        )
        section_title.pack(anchor="w", padx=15, pady=(15, 10))
        
        # Name *
        self.create_field(form, "Imię i Nazwisko *", "name")
        
        # Phone *
        self.create_field(form, "Telefon *", "phone")
        
        # Email
        self.create_field(form, "Email", "email")
        
        # Vehicle Info Section
        section_title2 = ctk.CTkLabel(
            form,
            text="Informacje o Pojeździe",
            font=("Segoe UI", 16, "bold"),
            text_color=COLORS["accent"]
        )
        section_title2.pack(anchor="w", padx=15, pady=(20, 10))
        
        # Registration number
        self.create_field(form, "Numer Rejestracyjny", "registration_number")
        
        # Car brand
        self.create_field(form, "Marka Pojazdu", "car_brand")
        
        # Car color
        self.create_field(form, "Kolor Pojazdu", "car_color")
        
        # Daily cost
        self.create_field(form, "Koszt Dzienny (PLN)", "daily_cost")
        
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
            text="Dodaj Kierowcę",
            command=self.save_driver,
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
    
    def save_driver(self):
        """Validate and save driver"""
        # Get values
        name = self.get_entry_value("name")
        phone = self.get_entry_value("phone")
        email = self.get_entry_value("email") or None
        registration_number = self.get_entry_value("registration_number") or None
        car_brand = self.get_entry_value("car_brand") or None
        car_color = self.get_entry_value("car_color") or None
        daily_cost_str = self.get_entry_value("daily_cost")
        
        # Validate required
        if not name:
            messagebox.showerror("Błąd", "Imię i nazwisko jest wymagane")
            return
        if not phone:
            messagebox.showerror("Błąd", "Telefon jest wymagany")
            return
        
        # Validate daily cost
        daily_cost = None
        if daily_cost_str:
            try:
                daily_cost = float(daily_cost_str)
                if daily_cost < 0:
                    raise ValueError()
            except:
                messagebox.showerror("Błąd", "Koszt dzienny musi być liczbą")
                return
        
        # Create driver
        driver = Driver(
            name=name,
            phone=phone,
            email=email,
            registration_number=registration_number,
            car_brand=car_brand,
            car_color=car_color,
            daily_cost=daily_cost
        )
        
        # Call callback
        self.on_save(driver)
        
        # Close dialog
        self.destroy()
