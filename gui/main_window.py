"""
Main application window
Equivalent to App.tsx in React version
"""

import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime
from database.db import Database
from database.models import Invoice, Driver, FuelEntry, Vehicle
from gui.dialogs.add_invoice_dialog import AddInvoiceDialog
from gui.dialogs.edit_invoice_dialog import EditInvoiceDialog
from gui.dialogs.add_driver_dialog import AddDriverDialog
from gui.dialogs.add_fuel_dialog import AddFuelDialog
from gui.components.notification_banner import NotificationBanner
from gui.components.financial_summary import FinancialSummary
from services.export_service import ExportService
import config


class MainWindow(ctk.CTk):
    """Main application window with tabs and all functionality"""
    
    def __init__(self):
        super().__init__()
        
        # Window configuration
        self.title(f"{config.APP_NAME} - {config.COMPANY_NAME}")
        self.geometry("1600x1000")
        self.minsize(1280, 800)
        
        # Database
        self.db = Database()
        
        # Services
        self.export_service = ExportService()
        
        # State
        self.current_tab = "outstanding"
        self.invoices = []
        self.drivers = []
        self.fuel_entries = []
        self.vehicles = []
        
        # Setup UI
        self.setup_ui()
        self.load_data()
        self.update_clock()
        
    def setup_ui(self):
        """Setup main UI layout"""
        # Main container
        main_frame = ctk.CTkFrame(self, fg_color=config.COLORS["bg_primary"])
        main_frame.pack(fill="both", expand=True)
        
        # Header
        self.create_header(main_frame)
        
        # Notification Banner
        self.notification_banner = NotificationBanner(main_frame)
        
        # Financial Summary (6 cards)
        self.financial_summary = FinancialSummary(main_frame, height=260)
        self.financial_summary.pack(fill="x", padx=20, pady=(20, 10))
        
        # Stats cards (4 cards - simpler stats)
        self.create_stats(main_frame)
        
        # Tab navigation
        self.create_tabs(main_frame)
        
        # Content area (will switch based on tab)
        self.content_frame = ctk.CTkFrame(main_frame, fg_color=config.COLORS["bg_primary"])
        self.content_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Load outstanding tab by default
        self.show_tab("outstanding")
        
    def create_header(self, parent):
        """Create header with logo, clock, and quick actions"""
        header = ctk.CTkFrame(parent, fg_color=config.COLORS["bg_tertiary"], height=80)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        # Logo and title
        logo_frame = ctk.CTkFrame(header, fg_color="transparent")
        logo_frame.pack(side="left", padx=20)
        
        ctk.CTkLabel(
            logo_frame,
            text="🚛",
            font=("Arial", 32)
        ).pack(side="left", padx=(0, 10))
        
        title_frame = ctk.CTkFrame(logo_frame, fg_color="transparent")
        title_frame.pack(side="left")
        
        ctk.CTkLabel(
            title_frame,
            text=config.APP_NAME,
            font=("Arial", 24, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(anchor="w")
        
        ctk.CTkLabel(
            title_frame,
            text=config.COMPANY_NAME,
            font=("Arial", 12),
            text_color=config.COLORS["text_secondary"]
        ).pack(anchor="w")
        
        # Clock in center
        clock_frame = ctk.CTkFrame(header, fg_color="transparent")
        clock_frame.pack(side="left", expand=True)
        
        self.clock_label = ctk.CTkLabel(
            clock_frame,
            text="00:00:00",
            font=("Arial", 28, "bold"),
            text_color=config.COLORS["accent_blue"]
        )
        self.clock_label.pack()
        
        self.date_label = ctk.CTkLabel(
            clock_frame,
            text="...",
            font=("Arial", 11),
            text_color=config.COLORS["text_secondary"]
        )
        self.date_label.pack()
        
        # Quick actions on right
        actions_frame = ctk.CTkFrame(header, fg_color="transparent")
        actions_frame.pack(side="right", padx=20)
        
        ctk.CTkButton(
            actions_frame,
            text="📥 Eksport PDF",
            command=self.export_pdf,
            fg_color=config.COLORS["info"],
            hover_color="#2196F3CC",
            width=140
        ).pack(side="left", padx=5)
        
        ctk.CTkButton(
            actions_frame,
            text="📊 Eksport CSV",
            command=self.export_csv,
            fg_color=config.COLORS["success"],
            hover_color="#66BB6A",
            width=140
        ).pack(side="left", padx=5)
        
        ctk.CTkButton(
            actions_frame,
            text="➕ Dodaj Fakturę",
            command=self.add_invoice_clicked,
            fg_color=config.COLORS["accent_blue"],
            hover_color=config.COLORS["accent_blue_hover"],
            width=150
        ).pack(side="left", padx=5)
        
    def create_stats(self, parent):
        """Create statistics cards"""
        stats_frame = ctk.CTkFrame(parent, fg_color=config.COLORS["bg_primary"], height=120)
        stats_frame.pack(fill="x", padx=20, pady=20)
        stats_frame.pack_propagate(False)
        
        # Configure grid
        stats_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)
        
        # Stats: Unpaid
        self.unpaid_card = self.create_stat_card(
            stats_frame, 0,
            "⏳ Oczekujące",
            "0", "0.00 PLN",
            config.COLORS["warning"]
        )
        
        # Stats: Paid
        self.paid_card = self.create_stat_card(
            stats_frame, 1,
            "✅ Opłacone",
            "0", "0.00 PLN",
            config.COLORS["success"]
        )
        
        # Stats: Drivers
        self.drivers_card = self.create_stat_card(
            stats_frame, 2,
            "🚛 Kierowcy",
            "0", "Aktywnych",
            config.COLORS["info"]
        )
        
        # Stats: Fuel
        self.fuel_card = self.create_stat_card(
            stats_frame, 3,
            "⛽ Paliwo",
            "0.00 PLN", "Ten miesiąc",
            config.COLORS["error"]
        )
        
    def create_stat_card(self, parent, column, title, value, subtitle, color):
        """Create a single stat card"""
        card = ctk.CTkFrame(
            parent,
            fg_color=config.COLORS["bg_secondary"],
            border_width=2,
            border_color=color
        )
        card.grid(row=0, column=column, padx=10, sticky="nsew")
        
        ctk.CTkLabel(
            card,
            text=title,
            font=("Arial", 12, "bold"),
            text_color=config.COLORS["text_secondary"]
        ).pack(pady=(15, 5))
        
        value_label = ctk.CTkLabel(
            card,
            text=value,
            font=("Arial", 32, "bold"),
            text_color=color
        )
        value_label.pack(pady=5)
        
        ctk.CTkLabel(
            card,
            text=subtitle,
            font=("Arial", 11),
            text_color=config.COLORS["text_secondary"]
        ).pack(pady=(0, 15))
        
        return {"frame": card, "value": value_label}
        
    def create_tabs(self, parent):
        """Create tab navigation"""
        tabs_frame = ctk.CTkFrame(
            parent,
            fg_color=config.COLORS["bg_tertiary"],
            height=60
        )
        tabs_frame.pack(fill="x", padx=0, pady=0)
        tabs_frame.pack_propagate(False)
        
        button_frame = ctk.CTkFrame(tabs_frame, fg_color="transparent")
        button_frame.pack(side="left", padx=20, pady=10)
        
        self.tab_buttons = {}
        tabs = [
            ("outstanding", "⏳ Oczekujące"),
            ("paid", "✅ Opłacone"),
            ("fuel", "⛽ Paliwo"),
            ("drivers", "🚛 Kierowcy"),
            ("balance", "📊 Bilans")
        ]
        
        for tab_id, tab_text in tabs:
            btn = ctk.CTkButton(
                button_frame,
                text=tab_text,
                command=lambda t=tab_id: self.show_tab(t),
                fg_color="transparent",
                text_color=config.COLORS["text_subtle"],
                hover_color=config.COLORS["bg_secondary"],
                width=150,
                height=40
            )
            btn.pack(side="left", padx=5)
            self.tab_buttons[tab_id] = btn
        
        # Highlight first tab
        self.tab_buttons["outstanding"].configure(
            fg_color=config.COLORS["accent_blue"],
            text_color="white"
        )
        
    def show_tab(self, tab_id):
        """Switch to different tab"""
        # Reset all buttons
        for btn_id, btn in self.tab_buttons.items():
            if btn_id == tab_id:
                btn.configure(
                    fg_color=config.COLORS["accent_blue"],
                    text_color="white"
                )
            else:
                btn.configure(
                    fg_color="transparent",
                    text_color=config.COLORS["text_subtle"]
                )
        
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Show appropriate content
        if tab_id == "outstanding":
            self.show_outstanding_invoices()
        elif tab_id == "paid":
            self.show_paid_invoices()
        elif tab_id == "fuel":
            self.show_fuel_entries()
        elif tab_id == "drivers":
            self.show_drivers()
        elif tab_id == "balance":
            self.show_balance()
        
        self.current_tab = tab_id
        
    def show_outstanding_invoices(self):
        """Show outstanding (unpaid) invoices"""
        outstanding = [inv for inv in self.invoices if not inv.get('is_paid', False)]
        
        # Scrollable frame
        scroll_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color=config.COLORS["bg_primary"]
        )
        scroll_frame.pack(fill="both", expand=True)
        
        if not outstanding:
            ctk.CTkLabel(
                scroll_frame,
                text="Brak oczekujących faktur",
                font=("Arial", 18),
                text_color=config.COLORS["text_secondary"]
            ).pack(pady=50)
        else:
            for invoice in outstanding:
                self.create_invoice_card(scroll_frame, invoice)
                
    def show_paid_invoices(self):
        """Show paid invoices"""
        paid = [inv for inv in self.invoices if inv.get('is_paid', False)]
        
        scroll_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color=config.COLORS["bg_primary"]
        )
        scroll_frame.pack(fill="both", expand=True)
        
        if not paid:
            ctk.CTkLabel(
                scroll_frame,
                text="Brak opłaconych faktur",
                font=("Arial", 18),
                text_color=config.COLORS["text_secondary"]
            ).pack(pady=50)
        else:
            for invoice in paid:
                self.create_invoice_card(scroll_frame, invoice)
                
    def create_invoice_card(self, parent, invoice):
        """Create invoice card component"""
        card = ctk.CTkFrame(
            parent,
            fg_color=config.COLORS["bg_secondary"],
            border_width=1,
            border_color=config.COLORS["border"]
        )
        card.pack(fill="x", padx=10, pady=10)
        
        # Header
        header_frame = ctk.CTkFrame(card, fg_color="transparent")
        header_frame.pack(fill="x", padx=20, pady=(15, 5))
        
        # Company name
        ctk.CTkLabel(
            header_frame,
            text=invoice.get('company_name', 'N/A'),
            font=("Arial", 18, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(side="left")
        
        # Status badge
        is_paid = invoice.get('is_paid', False)
        badge_color = config.COLORS["success"] if is_paid else config.COLORS["warning"]
        badge_text = "✅ Opłacono" if is_paid else "⏳ Oczekujące"
        
        badge = ctk.CTkLabel(
            header_frame,
            text=badge_text,
            fg_color=badge_color + "33",  # Add transparency
            text_color=badge_color,
            corner_radius=6,
            padx=10,
            pady=5,
            font=("Arial", 11, "bold")
        )
        badge.pack(side="right")
        
        # Details
        details_frame = ctk.CTkFrame(card, fg_color="transparent")
        details_frame.pack(fill="x", padx=20, pady=5)
        
        details_text = f"NIP: {invoice.get('nip', 'N/A')} | Kwota: {invoice.get('amount', 0):.2f} PLN | Termin: {invoice.get('deadline', 'N/A')}"
        ctk.CTkLabel(
            details_frame,
            text=details_text,
            font=("Arial", 12),
            text_color=config.COLORS["text_secondary"]
        ).pack(anchor="w")
        
        # Actions
        actions_frame = ctk.CTkFrame(card, fg_color="transparent")
        actions_frame.pack(fill="x", padx=20, pady=(5, 15))
        
        if not is_paid:
            ctk.CTkButton(
                actions_frame,
                text="Oznacz jako opłaconą",
                command=lambda inv=invoice: self.mark_as_paid(inv),
                fg_color=config.COLORS["success"],
                hover_color=config.COLORS["success"] + "CC",
                width=180,
                height=32
            ).pack(side="left", padx=(0, 10))
        
        ctk.CTkButton(
            actions_frame,
            text="Edytuj",
            command=lambda inv=invoice: self.edit_invoice(inv),
            fg_color=config.COLORS["accent_blue"],
            hover_color=config.COLORS["accent_blue_hover"],
            width=100,
            height=32
        ).pack(side="left", padx=(0, 10))
        
        ctk.CTkButton(
            actions_frame,
            text="Usuń",
            command=lambda inv=invoice: self.delete_invoice(inv),
            fg_color=config.COLORS["error"],
            hover_color=config.COLORS["error"] + "CC",
            width=100,
            height=32
        ).pack(side="left")
        
    def show_fuel_entries(self):
        """Show fuel entries tab"""
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Header with add button
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", pady=(0, 15))
        
        ctk.CTkLabel(
            header,
            text="⛽ Tankowania",
            font=("Arial", 20, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(side="left")
        
        ctk.CTkButton(
            header,
            text="➕ Dodaj Tankowanie",
            command=self.add_fuel_clicked,
            fg_color=config.COLORS["success"],
            hover_color="#66BB6A",
            width=180
        ).pack(side="right")
        
        # Scrollable list
        scroll_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color=config.COLORS["bg_primary"]
        )
        scroll_frame.pack(fill="both", expand=True)
        
        # Show fuel entries
        if not self.fuel_entries:
            ctk.CTkLabel(
                scroll_frame,
                text="Brak wpisów tankowania\nDodaj pierwszy wpis klikając przycisk powyżej",
                font=("Arial", 14),
                text_color=config.COLORS["text_secondary"]
            ).pack(pady=50)
        else:
            for fuel in sorted(self.fuel_entries, key=lambda x: x.get('date', ''), reverse=True):
                self.create_fuel_card(scroll_frame, fuel)
    
    def create_fuel_card(self, parent, fuel: dict):
        """Create a fuel entry card"""
        card = ctk.CTkFrame(
            parent,
            fg_color=config.COLORS["bg_secondary"],
            corner_radius=8,
            border_width=1,
            border_color=config.COLORS["border"]
        )
        card.pack(fill="x", padx=0, pady=5)
        
        # Content
        content = ctk.CTkFrame(card, fg_color="transparent")
        content.pack(fill="x", padx=15, pady=12)
        
        # Left: Info
        left = ctk.CTkFrame(content, fg_color="transparent")
        left.pack(side="left", fill="x", expand=True)
        
        # Date and station
        try:
            fuel_date = datetime.fromisoformat(fuel.get('date', '')).strftime("%d.%m.%Y")
        except:
            fuel_date = "N/A"
        
        ctk.CTkLabel(
            left,
            text=f"📅 {fuel_date} • {fuel.get('station', 'N/A')}",
            font=("Arial", 14, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(anchor="w")
        
        # Amount and liters
        ctk.CTkLabel(
            left,
            text=f"⛽ {fuel.get('liters', 0):.2f} L • {fuel.get('amount', 0):.2f} PLN",
            font=("Arial", 12),
            text_color=config.COLORS["text_secondary"]
        ).pack(anchor="w", pady=(5, 0))
        
        # Notes if any
        if fuel.get('notes'):
            ctk.CTkLabel(
                left,
                text=f"📝 {fuel.get('notes')}",
                font=("Arial", 11),
                text_color=config.COLORS["text_subtle"]
            ).pack(anchor="w", pady=(5, 0))
        
        # Right: Actions
        actions = ctk.CTkFrame(content, fg_color="transparent")
        actions.pack(side="right")
        
        ctk.CTkButton(
            actions,
            text="Usuń",
            command=lambda f=fuel: self.delete_fuel(f),
            fg_color=config.COLORS["error"],
            hover_color=config.COLORS["error"] + "CC",
            width=100,
            height=32
        ).pack()
    
    def add_fuel_clicked(self):
        """Handle add fuel button click"""
        dialog = AddFuelDialog(self, self.drivers, self.vehicles, self.on_fuel_added)
    
    def on_fuel_added(self, fuel: FuelEntry):
        """Callback when fuel is added"""
        self.db.add_fuel_entry(fuel)
        self.load_data()
        self.show_tab(self.current_tab)
        messagebox.showinfo("Sukces", "Tankowanie dodane!")
    
    def delete_fuel(self, fuel: dict):
        """Delete fuel entry"""
        if messagebox.askyesno("Potwierdź", "Czy na pewno usunąć ten wpis tankowania?"):
            self.db.delete_fuel_entry(fuel['id'])
            self.load_data()
            self.show_tab(self.current_tab)
            messagebox.showinfo("Sukces", "Tankowanie usunięte!")
        
    def show_drivers(self):
        """Show drivers tab"""
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Header with add button
        header = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        header.pack(fill="x", pady=(0, 15))
        
        ctk.CTkLabel(
            header,
            text="🚛 Kierowcy",
            font=("Arial", 20, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(side="left")
        
        ctk.CTkButton(
            header,
            text="➕ Dodaj Kierowcę",
            command=self.add_driver_clicked,
            fg_color=config.COLORS["success"],
            hover_color="#66BB6A",
            width=180
        ).pack(side="right")
        
        # Scrollable list
        scroll_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color=config.COLORS["bg_primary"]
        )
        scroll_frame.pack(fill="both", expand=True)
        
        # Show drivers
        if not self.drivers:
            ctk.CTkLabel(
                scroll_frame,
                text="Brak kierowców\nDodaj pierwszego kierowcę klikając przycisk powyżej",
                font=("Arial", 14),
                text_color=config.COLORS["text_secondary"]
            ).pack(pady=50)
        else:
            for driver in sorted(self.drivers, key=lambda x: x.get('name', '')):
                self.create_driver_card(scroll_frame, driver)
    
    def create_driver_card(self, parent, driver: dict):
        """Create a driver card"""
        card = ctk.CTkFrame(
            parent,
            fg_color=config.COLORS["bg_secondary"],
            corner_radius=8,
            border_width=1,
            border_color=config.COLORS["border"]
        )
        card.pack(fill="x", padx=0, pady=5)
        
        # Content
        content = ctk.CTkFrame(card, fg_color="transparent")
        content.pack(fill="x", padx=15, pady=12)
        
        # Left: Info
        left = ctk.CTkFrame(content, fg_color="transparent")
        left.pack(side="left", fill="x", expand=True)
        
        # Name
        ctk.CTkLabel(
            left,
            text=f"👤 {driver.get('name', 'N/A')}",
            font=("Arial", 16, "bold"),
            text_color=config.COLORS["text_primary"]
        ).pack(anchor="w")
        
        # Phone
        ctk.CTkLabel(
            left,
            text=f"📞 {driver.get('phone', 'N/A')}",
            font=("Arial", 12),
            text_color=config.COLORS["text_secondary"]
        ).pack(anchor="w", pady=(5, 0))
        
        # Vehicle info
        if driver.get('car_brand') or driver.get('registration_number'):
            car_info = ""
            if driver.get('car_brand'):
                car_info += f"🚗 {driver.get('car_brand', '')}"
            if driver.get('registration_number'):
                car_info += f" • 🔖 {driver.get('registration_number', '')}"
            
            ctk.CTkLabel(
                left,
                text=car_info,
                font=("Arial", 11),
                text_color=config.COLORS["text_subtle"]
            ).pack(anchor="w", pady=(5, 0))
        
        # Daily cost
        if driver.get('daily_cost'):
            ctk.CTkLabel(
                left,
                text=f"💰 {driver.get('daily_cost', 0):.2f} PLN/dzień",
                font=("Arial", 11, "bold"),
                text_color=config.COLORS["info"]
            ).pack(anchor="w", pady=(5, 0))
        
        # Right: Actions
        actions = ctk.CTkFrame(content, fg_color="transparent")
        actions.pack(side="right")
        
        ctk.CTkButton(
            actions,
            text="Usuń",
            command=lambda d=driver: self.delete_driver(d),
            fg_color=config.COLORS["error"],
            hover_color=config.COLORS["error"] + "CC",
            width=100,
            height=32
        ).pack()
    
    def add_driver_clicked(self):
        """Handle add driver button click"""
        dialog = AddDriverDialog(self, self.on_driver_added)
    
    def on_driver_added(self, driver: Driver):
        """Callback when driver is added"""
        self.db.add_driver(driver)
        self.load_data()
        self.show_tab(self.current_tab)
        messagebox.showinfo("Sukces", "Kierowca dodany!")
    
    def delete_driver(self, driver: dict):
        """Delete driver"""
        if messagebox.askyesno("Potwierdź", f"Czy na pewno usunąć kierowcę {driver.get('name', 'N/A')}?"):
            self.db.delete_driver(driver['id'])
            self.load_data()
            self.show_tab(self.current_tab)
            messagebox.showinfo("Sukces", "Kierowca usunięty!")
        
    def show_balance(self):
        """Show balance/statistics tab"""
        scroll_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color=config.COLORS["bg_primary"]
        )
        scroll_frame.pack(fill="both", expand=True)
        
        ctk.CTkLabel(
            scroll_frame,
            text="Tab Bilans - W trakcie implementacji",
            font=("Arial", 18),
            text_color=config.COLORS["text_secondary"]
        ).pack(pady=50)
        
    def load_data(self):
        """Load all data from database"""
        self.invoices = self.db.get_invoices()
        self.drivers = self.db.get_drivers()
        self.fuel_entries = self.db.get_fuel_entries()
        self.vehicles = self.db.get_vehicles()
        self.update_stats()
        self.update_components()
    
    def update_components(self):
        """Update notification banner and financial summary"""
        self.notification_banner.update(self.invoices)
        self.financial_summary.update(self.invoices, self.fuel_entries)
        
    def update_stats(self):
        """Update statistics cards"""
        unpaid = [inv for inv in self.invoices if not inv.get('is_paid', False)]
        paid = [inv for inv in self.invoices if inv.get('is_paid', False)]
        
        unpaid_total = sum(inv.get('amount', 0) for inv in unpaid)
        paid_total = sum(inv.get('amount', 0) for inv in paid)
        
        fuel_this_month = sum(
            entry.get('amount', 0) for entry in self.fuel_entries
            if datetime.fromisoformat(entry.get('date', datetime.now().isoformat())).month == datetime.now().month
        )
        
        self.unpaid_card["value"].configure(text=f"{len(unpaid)}")
        self.paid_card["value"].configure(text=f"{len(paid)}")
        self.drivers_card["value"].configure(text=f"{len(self.drivers)}")
        self.fuel_card["value"].configure(text=f"{fuel_this_month:.2f} PLN")
        
    def update_clock(self):
        """Update clock display"""
        now = datetime.now()
        self.clock_label.configure(text=now.strftime("%H:%M:%S"))
        self.date_label.configure(text=now.strftime("%A, %d %B %Y"))
        self.after(1000, self.update_clock)
        
    def add_invoice_clicked(self):
        """Handle add invoice button click"""
        dialog = AddInvoiceDialog(self, self.on_invoice_added)
    
    def on_invoice_added(self, invoice: Invoice):
        """Callback when invoice is added"""
        self.db.add_invoice(invoice)
        self.load_data()
        self.show_tab(self.current_tab)
        messagebox.showinfo("Sukces", "Faktura dodana pomyślnie!")
        
    def mark_as_paid(self, invoice):
        """Mark invoice as paid"""
        paid_at = datetime.now().isoformat()
        deadline = datetime.fromisoformat(invoice.get('deadline', datetime.now().isoformat()))
        paid_on_time = datetime.now() <= deadline
        
        self.db.mark_as_paid(invoice['id'], paid_at, paid_on_time)
        self.load_data()
        self.show_tab(self.current_tab)
        
        messagebox.showinfo("Sukces", "Faktura oznaczona jako opłacona!")
        
    def edit_invoice(self, invoice_dict):
        """Edit invoice"""
        # Convert dict to Invoice object
        invoice = Invoice(**invoice_dict)
        dialog = EditInvoiceDialog(self, invoice, self.on_invoice_edited)
    
    def on_invoice_edited(self, invoice: Invoice):
        """Callback when invoice is edited"""
        self.db.update_invoice(invoice.id, invoice)
        self.load_data()
        self.show_tab(self.current_tab)
        messagebox.showinfo("Sukces", "Faktura zaktualizowana!")
        
    def delete_invoice(self, invoice):
        """Delete invoice"""
        if messagebox.askyesno("Potwierdź", f"Czy na pewno usunąć fakturę {invoice.get('company_name')}?"):
            self.db.delete_invoice(invoice['id'])
            self.load_data()
            self.show_tab(self.current_tab)
            messagebox.showinfo("Sukces", "Faktura usunięta!")
    
    def export_pdf(self):
        """Export invoices to PDF"""
        try:
            filepath = self.export_service.export_invoices_pdf(self.invoices)
            messagebox.showinfo("Sukces", f"Eksport PDF zapisany:\n{filepath}")
        except Exception as e:
            messagebox.showerror("Błąd", f"Nie udało się wyeksportować PDF:\n{str(e)}")
    
    def export_csv(self):
        """Export current tab data to CSV"""
        try:
            if self.current_tab in ["outstanding", "paid"]:
                # Export invoices
                invoices_to_export = self.invoices
                if self.current_tab == "outstanding":
                    invoices_to_export = [inv for inv in self.invoices if not inv.get('is_paid', False)]
                elif self.current_tab == "paid":
                    invoices_to_export = [inv for inv in self.invoices if inv.get('is_paid', False)]
                
                filepath = self.export_service.export_invoices_csv(invoices_to_export)
            elif self.current_tab == "fuel":
                filepath = self.export_service.export_fuel_entries_csv(self.fuel_entries)
            elif self.current_tab == "drivers":
                filepath = self.export_service.export_drivers_csv(self.drivers)
            else:
                # Default to all invoices
                filepath = self.export_service.export_invoices_csv(self.invoices)
            
            messagebox.showinfo("Sukces", f"Eksport CSV zapisany:\n{filepath}")
        except Exception as e:
            messagebox.showerror("Błąd", f"Nie udało się wyeksportować CSV:\n{str(e)}")
            
    def on_closing(self):
        """Handle window close"""
        self.db.close()
        self.destroy()
