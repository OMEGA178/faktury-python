"""
Financial Summary Component
Shows 6 key financial metrics
Matches React's FinancialSummary.tsx
"""

import customtkinter as ctk
from datetime import datetime
from config import COLORS


class FinancialSummary(ctk.CTkFrame):
    """Component showing financial summary with 6 metric cards"""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self.metric_cards = {}
        self.setup_ui()
    
    def setup_ui(self):
        """Create 6 metric cards"""
        # Configure grid
        self.grid_columnconfigure((0, 1, 2), weight=1)
        self.grid_rowconfigure((0, 1), weight=1)
        
        # Row 1
        self.metric_cards['unpaid'] = self.create_metric_card(
            0, 0,
            "💰 Nieopłacone",
            "0.00 PLN",
            "0 faktur",
            COLORS["warning"]
        )
        
        self.metric_cards['paid'] = self.create_metric_card(
            0, 1,
            "✅ Opłacone",
            "0.00 PLN",
            "0 faktur",
            COLORS["success"]
        )
        
        self.metric_cards['fuel'] = self.create_metric_card(
            0, 2,
            "⛽ Paliwo",
            "0.00 PLN",
            "Ten miesiąc",
            COLORS["error"]
        )
        
        # Row 2
        self.metric_cards['profit'] = self.create_metric_card(
            1, 0,
            "📊 Zysk",
            "0.00 PLN",
            "Po kosztach paliwa",
            COLORS["info"]
        )
        
        self.metric_cards['avg_payment_time'] = self.create_metric_card(
            1, 1,
            "⏱️ Śr. czas płatności",
            "0 dni",
            "Dla opłaconych",
            COLORS["accent"]
        )
        
        self.metric_cards['on_time_percent'] = self.create_metric_card(
            1, 2,
            "🎯 Terminowość",
            "0%",
            "Płatności na czas",
            COLORS["success"]
        )
    
    def create_metric_card(self, row, col, title, value, subtitle, color):
        """Create a single metric card"""
        card = ctk.CTkFrame(
            self,
            fg_color=COLORS["card"],
            corner_radius=8,
            border_width=2,
            border_color=color
        )
        card.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
        
        # Title
        title_label = ctk.CTkLabel(
            card,
            text=title,
            font=("Segoe UI", 13, "bold"),
            text_color=COLORS["text_secondary"]
        )
        title_label.pack(pady=(15, 5))
        
        # Value
        value_label = ctk.CTkLabel(
            card,
            text=value,
            font=("Segoe UI", 28, "bold"),
            text_color=color
        )
        value_label.pack(pady=5)
        
        # Subtitle
        subtitle_label = ctk.CTkLabel(
            card,
            text=subtitle,
            font=("Segoe UI", 11),
            text_color=COLORS["text_subtle"]
        )
        subtitle_label.pack(pady=(0, 15))
        
        return {
            'card': card,
            'value': value_label,
            'subtitle': subtitle_label
        }
    
    def update(self, invoices: list, fuel_entries: list):
        """Update all metrics based on data"""
        # Filter paid and unpaid
        unpaid = [inv for inv in invoices if not inv.get('is_paid', False)]
        paid = [inv for inv in invoices if inv.get('is_paid', False)]
        
        # Calculate totals
        unpaid_total = sum(inv.get('amount', 0) for inv in unpaid)
        paid_total = sum(inv.get('amount', 0) for inv in paid)
        
        # Fuel this month
        now = datetime.now()
        fuel_this_month = sum(
            entry.get('amount', 0)
            for entry in fuel_entries
            if datetime.fromisoformat(entry.get('date', '')).year == now.year
            and datetime.fromisoformat(entry.get('date', '')).month == now.month
        )
        
        # Profit (paid - fuel)
        profit = paid_total - fuel_this_month
        
        # Average payment time (for paid invoices)
        payment_times = []
        for inv in paid:
            if inv.get('paid_at') and inv.get('issue_date'):
                try:
                    paid_date = datetime.fromisoformat(inv['paid_at'].replace('Z', '+00:00'))
                    issue_date = datetime.fromisoformat(inv['issue_date'].replace('Z', '+00:00'))
                    days = (paid_date - issue_date).days
                    payment_times.append(days)
                except:
                    pass
        
        avg_payment_time = sum(payment_times) / len(payment_times) if payment_times else 0
        
        # On-time percentage
        on_time_count = sum(1 for inv in paid if inv.get('paid_on_time', False))
        on_time_percent = (on_time_count / len(paid) * 100) if paid else 0
        
        # Update UI
        self.metric_cards['unpaid']['value'].configure(text=f"{unpaid_total:,.2f} PLN")
        self.metric_cards['unpaid']['subtitle'].configure(text=f"{len(unpaid)} faktur")
        
        self.metric_cards['paid']['value'].configure(text=f"{paid_total:,.2f} PLN")
        self.metric_cards['paid']['subtitle'].configure(text=f"{len(paid)} faktur")
        
        self.metric_cards['fuel']['value'].configure(text=f"{fuel_this_month:,.2f} PLN")
        
        self.metric_cards['profit']['value'].configure(text=f"{profit:,.2f} PLN")
        profit_color = COLORS["success"] if profit >= 0 else COLORS["error"]
        self.metric_cards['profit']['value'].configure(text_color=profit_color)
        
        self.metric_cards['avg_payment_time']['value'].configure(text=f"{int(avg_payment_time)} dni")
        
        self.metric_cards['on_time_percent']['value'].configure(text=f"{int(on_time_percent)}%")
        
        # Color code on-time percentage
        if on_time_percent >= 80:
            perc_color = COLORS["success"]
        elif on_time_percent >= 60:
            perc_color = COLORS["warning"]
        else:
            perc_color = COLORS["error"]
        self.metric_cards['on_time_percent']['value'].configure(text_color=perc_color)
