"""
Notification Banner Component
Shows overdue and upcoming invoices
Matches React's NotificationBanner.tsx
"""

import customtkinter as ctk
from datetime import datetime, timedelta
from config import COLORS


class NotificationBanner(ctk.CTkFrame):
    """Banner showing important notifications about invoices"""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self.notifications = []
        self.container = None
        
    def update(self, invoices: list):
        """Update notifications based on invoices"""
        # Clear previous notifications
        self.notifications = []
        
        now = datetime.now()
        
        for inv in invoices:
            # Skip paid invoices
            if inv.get('is_paid', False):
                continue
            
            try:
                deadline = datetime.fromisoformat(inv.get('deadline', '').replace('Z', '+00:00'))
            except:
                continue
            
            days_until = (deadline - now).days
            
            # Overdue invoices
            if days_until < 0:
                self.notifications.append({
                    'type': 'overdue',
                    'message': f"⚠️ Faktura przeterminowana: {inv.get('company_name', 'N/A')} ({abs(days_until)} dni temu)",
                    'color': COLORS['error']
                })
            # Due in 3 days or less
            elif days_until <= 3:
                self.notifications.append({
                    'type': 'upcoming',
                    'message': f"⏰ Nadchodząca płatność: {inv.get('company_name', 'N/A')} (za {days_until} dni)",
                    'color': COLORS['warning']
                })
        
        self.render()
    
    def render(self):
        """Render notification banner"""
        # Clear previous widgets
        for widget in self.winfo_children():
            widget.destroy()
        
        # Hide if no notifications
        if not self.notifications:
            self.pack_forget()
            return
        
        # Show banner
        self.pack(fill="x", padx=20, pady=(20, 0))
        
        # Container
        self.container = ctk.CTkFrame(
            self,
            fg_color=COLORS["card"],
            corner_radius=8,
            border_width=2,
            border_color=COLORS["error"] if any(n['type'] == 'overdue' for n in self.notifications) else COLORS["warning"]
        )
        self.container.pack(fill="x", padx=0, pady=0)
        
        # Title
        title_text = "🚨 Uwaga!" if any(n['type'] == 'overdue' for n in self.notifications) else "📋 Powiadomienia"
        title = ctk.CTkLabel(
            self.container,
            text=title_text,
            font=("Segoe UI", 14, "bold"),
            text_color=COLORS["text_primary"]
        )
        title.pack(anchor="w", padx=15, pady=(10, 5))
        
        # Notifications (limit to 5)
        for notification in self.notifications[:5]:
            notif_label = ctk.CTkLabel(
                self.container,
                text=notification['message'],
                font=("Segoe UI", 12),
                text_color=notification['color'],
                anchor="w"
            )
            notif_label.pack(anchor="w", padx=15, pady=2)
        
        # Show count if more than 5
        if len(self.notifications) > 5:
            more_label = ctk.CTkLabel(
                self.container,
                text=f"... i {len(self.notifications) - 5} więcej",
                font=("Segoe UI", 11, "italic"),
                text_color=COLORS["text_subtle"],
                anchor="w"
            )
            more_label.pack(anchor="w", padx=15, pady=(5, 10))
        else:
            # Add bottom padding
            ctk.CTkFrame(self.container, fg_color="transparent", height=5).pack()
