"""
Export Service - PDF and CSV generation
Matches React's export.ts functionality
"""

from datetime import datetime
from typing import List
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import csv

from config import COMPANY_NAME, APP_NAME


class ExportService:
    """Service for exporting data to PDF and CSV"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Setup custom PDF styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#1E40AF'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#6B7280'),
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Header style
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=12
        ))
    
    def export_invoices_pdf(self, invoices: List[dict], filename: str = None) -> str:
        """Export invoices to PDF file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"faktury_{timestamp}.pdf"
        
        # Ensure exports directory exists
        os.makedirs("exports", exist_ok=True)
        filepath = os.path.join("exports", filename)
        
        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Title
        title = Paragraph(f"{APP_NAME} - Raport Faktur", self.styles['CustomTitle'])
        story.append(title)
        
        # Subtitle
        subtitle = Paragraph(
            f"{COMPANY_NAME}<br/>Wygenerowano: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
            self.styles['CustomSubtitle']
        )
        story.append(subtitle)
        story.append(Spacer(1, 0.5*cm))
        
        # Summary
        total_amount = sum(inv.get('amount', 0) for inv in invoices)
        paid_amount = sum(inv.get('amount', 0) for inv in invoices if inv.get('is_paid', False))
        unpaid_amount = total_amount - paid_amount
        
        summary_header = Paragraph("Podsumowanie", self.styles['CustomHeader'])
        story.append(summary_header)
        
        summary_data = [
            ['Metryka', 'Wartość'],
            ['Liczba faktur', str(len(invoices))],
            ['Opłacone', f"{paid_amount:,.2f} PLN"],
            ['Nieopłacone', f"{unpaid_amount:,.2f} PLN"],
            ['Razem', f"{total_amount:,.2f} PLN"]
        ]
        
        summary_table = Table(summary_data, colWidths=[8*cm, 8*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB'))
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 1*cm))
        
        # Invoice list
        list_header = Paragraph("Lista Faktur", self.styles['CustomHeader'])
        story.append(list_header)
        
        # Table data
        table_data = [['Data', 'Firma', 'NIP', 'Kwota', 'Termin', 'Status']]
        
        for inv in sorted(invoices, key=lambda x: x.get('created_at', ''), reverse=True):
            try:
                issue_date = datetime.fromisoformat(inv.get('issue_date', '')).strftime('%d.%m.%Y')
            except:
                issue_date = 'N/A'
            
            try:
                deadline = datetime.fromisoformat(inv.get('deadline', '')).strftime('%d.%m.%Y')
            except:
                deadline = 'N/A'
            
            status = 'Opłacona' if inv.get('is_paid', False) else 'Oczekuje'
            
            table_data.append([
                issue_date,
                inv.get('company_name', 'N/A')[:20],
                inv.get('nip', 'N/A'),
                f"{inv.get('amount', 0):,.2f}",
                deadline,
                status
            ])
        
        invoice_table = Table(table_data, colWidths=[2.5*cm, 5*cm, 3*cm, 2.5*cm, 2.5*cm, 2.5*cm])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')])
        ]))
        story.append(invoice_table)
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def export_invoices_csv(self, invoices: List[dict], filename: str = None) -> str:
        """Export invoices to CSV file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"faktury_{timestamp}.csv"
        
        # Ensure exports directory exists
        os.makedirs("exports", exist_ok=True)
        filepath = os.path.join("exports", filename)
        
        # Write CSV
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'ID', 'Data wystawienia', 'Firma', 'NIP', 'Kwota', 
                'Termin płatności', 'Termin (dni)', 'Opis', 'Status',
                'Data opłacenia', 'Terminowa', 'Telefon', 'Dystans'
            ])
            
            # Data rows
            for inv in invoices:
                try:
                    issue_date = datetime.fromisoformat(inv.get('issue_date', '')).strftime('%Y-%m-%d')
                except:
                    issue_date = ''
                
                try:
                    deadline = datetime.fromisoformat(inv.get('deadline', '')).strftime('%Y-%m-%d')
                except:
                    deadline = ''
                
                try:
                    paid_at = datetime.fromisoformat(inv.get('paid_at', '')).strftime('%Y-%m-%d') if inv.get('paid_at') else ''
                except:
                    paid_at = ''
                
                writer.writerow([
                    inv.get('id', ''),
                    issue_date,
                    inv.get('company_name', ''),
                    inv.get('nip', ''),
                    inv.get('amount', 0),
                    deadline,
                    inv.get('payment_term', 0),
                    inv.get('description', ''),
                    'Opłacona' if inv.get('is_paid', False) else 'Oczekuje',
                    paid_at,
                    'Tak' if inv.get('paid_on_time', False) else 'Nie',
                    inv.get('contact_phone', ''),
                    inv.get('calculated_distance', '')
                ])
        
        return filepath
    
    def export_fuel_entries_csv(self, fuel_entries: List[dict], filename: str = None) -> str:
        """Export fuel entries to CSV file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"tankowania_{timestamp}.csv"
        
        os.makedirs("exports", exist_ok=True)
        filepath = os.path.join("exports", filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'ID', 'Data', 'Kwota', 'Litry', 'Stacja',
                'Kierowca ID', 'Pojazd ID', 'Notatki'
            ])
            
            # Data rows
            for fuel in fuel_entries:
                try:
                    fuel_date = datetime.fromisoformat(fuel.get('date', '')).strftime('%Y-%m-%d')
                except:
                    fuel_date = ''
                
                writer.writerow([
                    fuel.get('id', ''),
                    fuel_date,
                    fuel.get('amount', 0),
                    fuel.get('liters', 0),
                    fuel.get('station', ''),
                    fuel.get('driver_id', ''),
                    fuel.get('vehicle_id', ''),
                    fuel.get('notes', '')
                ])
        
        return filepath
    
    def export_drivers_csv(self, drivers: List[dict], filename: str = None) -> str:
        """Export drivers to CSV file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"kierowcy_{timestamp}.csv"
        
        os.makedirs("exports", exist_ok=True)
        filepath = os.path.join("exports", filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'ID', 'Imię i nazwisko', 'Telefon', 'Email',
                'Nr rejestracyjny', 'Marka pojazdu', 'Kolor', 'Koszt dzienny'
            ])
            
            # Data rows
            for driver in drivers:
                writer.writerow([
                    driver.get('id', ''),
                    driver.get('name', ''),
                    driver.get('phone', ''),
                    driver.get('email', ''),
                    driver.get('registration_number', ''),
                    driver.get('car_brand', ''),
                    driver.get('car_color', ''),
                    driver.get('daily_cost', '')
                ])
        
        return filepath
