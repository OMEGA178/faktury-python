# PLAN PRZEPISANIA NA PYTHON

## Analiza projektu React:
- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Icons**: Phosphor Icons
- **PDF**: jsPDF + jsPDF-AutoTable
- **Charts**: D3.js
- **State**: React hooks + useKV (GitHub Spark)

## Python Stack (wybrane technologie):

### GUI Framework: **CustomTkinter**
- Nowoczesny wygląd (podobny do materialdesign)
- Ciemny/jasny motyw
- Łatwe stylowanie
- Natywny Python (bez webview)

### Database: **TinyDB** lub **SQLite**
- TinyDB: prosty JSON-based (jak Firebase structure)
- SQLite: bardziej tradycyjny, szybki

### PDF: **ReportLab**
- Profesjonalne PDFy
- Tabele, obrazy, style

### Pozostałe:
- **Pillow**: Obsługa obrazów
- **python-dateutil**: Daty
- **matplotlib**: Wykresy (zamiast D3)

## Struktura katalogów Python:

```
faktury-python/
├── main.py                 # Entry point
├── requirements.txt        # Dependencies
├── config.py              # Configuration
├── database/
│   ├── __init__.py
│   ├── db.py              # Database handler
│   └── models.py          # Data models
├── gui/
│   ├── __init__.py
│   ├── main_window.py     # Main app window
│   ├── components/        # Reusable components
│   │   ├── invoice_card.py
│   │   ├── fuel_card.py
│   │   └── ...
│   └── dialogs/           # Dialog windows
│       ├── add_invoice.py
│       ├── edit_invoice.py
│       └── ...
├── services/
│   ├── __init__.py
│   ├── export_service.py  # PDF/CSV export
│   ├── backup_service.py
│   └── sync_service.py
└── utils/
    ├── __init__.py
    ├── formatters.py      # Format NIP, phone, currency
    └── validators.py

```

## Mapowanie komponentów:

### React → Python CustomTkinter

1. **App.tsx** → **main_window.py**
   - Main window z tabs
   - State management → class attributes
   
2. **InvoiceCard.tsx** → **invoice_card.py**
   - CTkFrame z labels, buttons
   
3. **AddInvoiceDialog.tsx** → **add_invoice_dialog.py**
   - CTkToplevel window
   - CTkEntry, CTkButton, etc.

4. **FinancialSummary.tsx** → **financial_summary.py**
   - CTkFrame z statystykami
   
5. **BalanceTab.tsx** → **balance_tab.py**
   - Tab z wykresami matplotlib

## Etapy implementacji:

### FAZA 1: Setup + Database
- [ ] Init Python project
- [ ] Setup TinyDB/SQLite
- [ ] Models (Invoice, Driver, FuelEntry, Vehicle)
- [ ] Basic CRUD operations

### FAZA 2: Main Window + Tabs
- [ ] Main window layout
- [ ] Tab navigation (5 tabs jak w React)
- [ ] Header z zegarem i statusem

### FAZA 3: Invoice Card + List
- [ ] InvoiceCard component
- [ ] Scrollable list
- [ ] Status badges (paid/unpaid)

### FAZA 4: Dialogs
- [ ] AddInvoiceDialog
- [ ] EditInvoiceDialog  
- [ ] AddDriverDialog
- [ ] AddFuelDialog
- [ ] AddVehicleDialog

### FAZA 5: Advanced Features
- [ ] Search/Filter
- [ ] Financial Summary
- [ ] Balance Tab z wykresami
- [ ] Export do PDF/CSV

### FAZA 6: Polish
- [ ] Icons (emoji lub Pillow)
- [ ] Theming (dark/light)
- [ ] Keyboard shortcuts
- [ ] Error handling

## Timeline:
Rozpoczynam implementację TERAZ!
