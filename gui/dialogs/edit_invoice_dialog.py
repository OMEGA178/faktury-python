"""
Edit Invoice Dialog
Matches React's EditInvoiceDialog.tsx functionality
"""

import customtkinter as ctk
from datetime import datetime, timedelta
from tkinter import filedialog, messagebox
from typing import Optional, Callable
import base64
from PIL import Image
import io

from config import COLORS
from database.models import Invoice


class EditInvoiceDialog(ctk.CTkToplevel):
    """Dialog for editing an existing invoice"""
    
    def __init__(self, parent, invoice: Invoice, on_save: Callable[[Invoice], None]):
        super().__init__(parent)
        
        self.invoice = invoice
        self.on_save = on_save
        self.invoice_images = invoice.invoice_images
        self.cargo_images = invoice.cargo_images
        
        # Configure window
        self.title("Edytuj Fakturę")
        self.geometry("800x900")
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
        self.populate_fields()
    
    def setup_ui(self):
        """Create dialog UI"""
        # Main container with scrollable frame
        self.scroll_frame = ctk.CTkScrollableFrame(
            self,
            fg_color=COLORS["background"],
            scrollbar_button_color=COLORS["accent"],
            scrollbar_button_hover_color=COLORS["accent_hover"]
        )
        self.scroll_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Title
        title = ctk.CTkLabel(
            self.scroll_frame,
            text="✏️ Edytuj Fakturę",
            font=("Segoe UI", 24, "bold"),
            text_color=COLORS["text_primary"]
        )
        title.pack(pady=(0, 20))
        
        # COMPANY INFO SECTION
        self.create_section("Dane Firmy", [
            ("Nazwa Firmy", "company_name", "text", True),
            ("NIP", "nip", "text", True),
            ("Telefon Kontaktowy", "contact_phone", "text", False),
        ])
        
        # INVOICE DETAILS SECTION
        self.create_section("Szczegóły Faktury", [
            ("Kwota (PLN)", "amount", "number", True),
            ("Data Wystawienia", "issue_date", "date", True),
            ("Termin Płatności (dni)", "payment_term", "number", True),
            ("Opis / Notatki", "description", "textarea", False),
        ])
        
        # ROUTE INFO SECTION
        self.create_section("Trasa", [
            ("Załadunek - Miasto", "loading_city", "text", False),
            ("Załadunek - Adres", "loading_address", "text", False),
            ("Rozładunek - Miasto", "unloading_city", "text", False),
            ("Rozładunek - Adres", "unloading_address", "text", False),
            ("Dystans (km)", "calculated_distance", "number", False),
        ])
        
        # IMAGES SECTION
        self.create_images_section()
        
        # BUTTONS
        self.create_buttons()
    
    def create_section(self, title: str, fields: list):
        """Create a section with fields"""
        section = ctk.CTkFrame(self.scroll_frame, fg_color=COLORS["card"], corner_radius=8)
        section.pack(fill="x", pady=(0, 15))
        
        section_title = ctk.CTkLabel(
            section,
            text=title,
            font=("Segoe UI", 16, "bold"),
            text_color=COLORS["accent"]
        )
        section_title.pack(anchor="w", padx=15, pady=(15, 10))
        
        for label, field_name, field_type, required in fields:
            self.create_field(section, label, field_name, field_type, required)
    
    def create_field(self, parent, label: str, field_name: str, field_type: str, required: bool):
        """Create a single form field"""
        container = ctk.CTkFrame(parent, fg_color="transparent")
        container.pack(fill="x", padx=15, pady=5)
        
        label_text = f"{label} {'*' if required else ''}"
        lbl = ctk.CTkLabel(
            container,
            text=label_text,
            font=("Segoe UI", 12),
            text_color=COLORS["text_secondary"],
            anchor="w"
        )
        lbl.pack(anchor="w", pady=(0, 5))
        
        if field_type == "textarea":
            entry = ctk.CTkTextbox(
                container,
                height=80,
                fg_color=COLORS["input_bg"],
                border_color=COLORS["border"],
                border_width=1,
                text_color=COLORS["text_primary"]
            )
            entry.pack(fill="x")
        else:
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
    
    def create_images_section(self):
        """Create image upload section"""
        section = ctk.CTkFrame(self.scroll_frame, fg_color=COLORS["card"], corner_radius=8)
        section.pack(fill="x", pady=(0, 15))
        
        section_title = ctk.CTkLabel(
            section,
            text="Zdjęcia",
            font=("Segoe UI", 16, "bold"),
            text_color=COLORS["accent"]
        )
        section_title.pack(anchor="w", padx=15, pady=(15, 10))
        
        # Invoice images
        invoice_btn_frame = ctk.CTkFrame(section, fg_color="transparent")
        invoice_btn_frame.pack(fill="x", padx=15, pady=5)
        
        self.invoice_images_btn = ctk.CTkButton(
            invoice_btn_frame,
            text="📄 Zmień Zdjęcia Faktury",
            command=lambda: self.select_images("invoice"),
            fg_color=COLORS["accent"],
            hover_color=COLORS["accent_hover"],
            height=36
        )
        self.invoice_images_btn.pack(fill="x")
        
        self.invoice_images_label = ctk.CTkLabel(
            invoice_btn_frame,
            text="",
            font=("Segoe UI", 10),
            text_color=COLORS["text_subtle"]
        )
        self.invoice_images_label.pack(anchor="w", pady=(5, 0))
        
        # Cargo images
        cargo_btn_frame = ctk.CTkFrame(section, fg_color="transparent")
        cargo_btn_frame.pack(fill="x", padx=15, pady=5)
        
        self.cargo_images_btn = ctk.CTkButton(
            cargo_btn_frame,
            text="📦 Zmień Zdjęcia Towaru",
            command=lambda: self.select_images("cargo"),
            fg_color=COLORS["accent"],
            hover_color=COLORS["accent_hover"],
            height=36
        )
        self.cargo_images_btn.pack(fill="x")
        
        self.cargo_images_label = ctk.CTkLabel(
            cargo_btn_frame,
            text="",
            font=("Segoe UI", 10),
            text_color=COLORS["text_subtle"]
        )
        self.cargo_images_label.pack(anchor="w", pady=(5, 0))
    
    def select_images(self, image_type: str):
        """Open file dialog to select images"""
        files = filedialog.askopenfilenames(
            title=f"Wybierz zdjęcia {'faktury' if image_type == 'invoice' else 'towaru'}",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")]
        )
        
        if files:
            encoded_images = []
            for file_path in files:
                try:
                    with Image.open(file_path) as img:
                        max_size = (1920, 1920)
                        img.thumbnail(max_size, Image.Resampling.LANCZOS)
                        
                        buffer = io.BytesIO()
                        img.save(buffer, format="PNG")
                        img_bytes = buffer.getvalue()
                        encoded = base64.b64encode(img_bytes).decode('utf-8')
                        encoded_images.append(f"data:image/png;base64,{encoded}")
                except Exception as e:
                    messagebox.showerror("Błąd", f"Nie można wczytać {file_path}: {e}")
            
            encoded_str = "|||".join(encoded_images)
            
            if image_type == "invoice":
                self.invoice_images = encoded_str
                self.invoice_images_label.configure(
                    text=f"Wybrano {len(encoded_images)} zdjęć",
                    text_color=COLORS["success"]
                )
            else:
                self.cargo_images = encoded_str
                self.cargo_images_label.configure(
                    text=f"Wybrano {len(encoded_images)} zdjęć",
                    text_color=COLORS["success"]
                )
    
    def populate_fields(self):
        """Populate fields with invoice data"""
        # Company info
        self.entry_company_name.insert(0, self.invoice.company_name)
        self.entry_nip.insert(0, self.invoice.nip)
        if self.invoice.contact_phone:
            self.entry_contact_phone.insert(0, self.invoice.contact_phone)
        
        # Invoice details
        self.entry_amount.insert(0, str(self.invoice.amount))
        
        if self.invoice.issue_date:
            try:
                issue_date = datetime.fromisoformat(self.invoice.issue_date.replace('Z', '+00:00'))
                self.entry_issue_date.insert(0, issue_date.strftime("%Y-%m-%d"))
            except:
                self.entry_issue_date.insert(0, datetime.now().strftime("%Y-%m-%d"))
        
        self.entry_payment_term.insert(0, str(self.invoice.payment_term))
        
        if self.invoice.description:
            self.entry_description.insert("1.0", self.invoice.description)
        
        # Route info
        if self.invoice.loading_location:
            if self.invoice.loading_location.get("city"):
                self.entry_loading_city.insert(0, self.invoice.loading_location["city"])
            if self.invoice.loading_location.get("address"):
                self.entry_loading_address.insert(0, self.invoice.loading_location["address"])
        
        if self.invoice.unloading_location:
            if self.invoice.unloading_location.get("city"):
                self.entry_unloading_city.insert(0, self.invoice.unloading_location["city"])
            if self.invoice.unloading_location.get("address"):
                self.entry_unloading_address.insert(0, self.invoice.unloading_location["address"])
        
        if self.invoice.calculated_distance:
            self.entry_calculated_distance.insert(0, str(self.invoice.calculated_distance))
        
        # Update image labels
        if self.invoice.invoice_images:
            count = len(self.invoice.invoice_images.split("|||"))
            self.invoice_images_label.configure(
                text=f"Obecne: {count} zdjęć",
                text_color=COLORS["success"]
            )
        else:
            self.invoice_images_label.configure(text="Brak zdjęć")
        
        if self.invoice.cargo_images:
            count = len(self.invoice.cargo_images.split("|||"))
            self.cargo_images_label.configure(
                text=f"Obecne: {count} zdjęć",
                text_color=COLORS["success"]
            )
        else:
            self.cargo_images_label.configure(text="Brak zdjęć")
    
    def create_buttons(self):
        """Create action buttons"""
        btn_frame = ctk.CTkFrame(self.scroll_frame, fg_color="transparent")
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
            text="Zapisz Zmiany",
            command=self.save_invoice,
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
        
        if isinstance(entry, ctk.CTkTextbox):
            return entry.get("1.0", "end-1c").strip()
        else:
            return entry.get().strip()
    
    def save_invoice(self):
        """Validate and save invoice"""
        # Get values
        company_name = self.get_entry_value("company_name")
        nip = self.get_entry_value("nip")
        amount_str = self.get_entry_value("amount")
        issue_date_str = self.get_entry_value("issue_date")
        payment_term_str = self.get_entry_value("payment_term")
        
        # Validate
        if not company_name:
            messagebox.showerror("Błąd", "Nazwa firmy jest wymagana")
            return
        if not nip:
            messagebox.showerror("Błąd", "NIP jest wymagany")
            return
        if not amount_str:
            messagebox.showerror("Błąd", "Kwota jest wymagana")
            return
        if not payment_term_str:
            messagebox.showerror("Błąd", "Termin płatności jest wymagany")
            return
        
        try:
            amount = float(amount_str)
            if amount <= 0:
                raise ValueError()
        except:
            messagebox.showerror("Błąd", "Kwota musi być liczbą większą od 0")
            return
        
        try:
            payment_term = int(payment_term_str)
            if payment_term <= 0:
                raise ValueError()
        except:
            messagebox.showerror("Błąd", "Termin płatności musi być liczbą większą od 0")
            return
        
        try:
            if issue_date_str:
                issue_date = datetime.strptime(issue_date_str, "%Y-%m-%d")
            else:
                issue_date = datetime.now()
        except:
            messagebox.showerror("Błąd", "Nieprawidłowy format daty (YYYY-MM-DD)")
            return
        
        deadline = issue_date + timedelta(days=payment_term)
        
        contact_phone = self.get_entry_value("contact_phone") or None
        description = self.get_entry_value("description") or None
        
        loading_city = self.get_entry_value("loading_city")
        loading_address = self.get_entry_value("loading_address")
        unloading_city = self.get_entry_value("unloading_city")
        unloading_address = self.get_entry_value("unloading_address")
        distance_str = self.get_entry_value("calculated_distance")
        
        loading_location = None
        if loading_city or loading_address:
            loading_location = {"city": loading_city, "address": loading_address}
        
        unloading_location = None
        if unloading_city or unloading_address:
            unloading_location = {"city": unloading_city, "address": unloading_address}
        
        calculated_distance = None
        if distance_str:
            try:
                calculated_distance = float(distance_str)
            except:
                pass
        
        # Update invoice object
        self.invoice.company_name = company_name
        self.invoice.nip = nip
        self.invoice.amount = amount
        self.invoice.deadline = deadline.isoformat()
        self.invoice.payment_term = payment_term
        self.invoice.issue_date = issue_date.isoformat()
        self.invoice.description = description
        self.invoice.contact_phone = contact_phone
        self.invoice.loading_location = loading_location
        self.invoice.unloading_location = unloading_location
        self.invoice.calculated_distance = calculated_distance
        self.invoice.invoice_images = self.invoice_images
        self.invoice.cargo_images = self.cargo_images
        
        # Call callback
        self.on_save(self.invoice)
        
        # Close dialog
        self.destroy()
