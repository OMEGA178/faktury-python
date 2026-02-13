# Struktura Aplikacji - Gadowski System Faktur

## 📁 Struktura Folderów

```
src/
├── App.tsx                    # Główny komponent aplikacji
├── ErrorFallback.tsx          # Obsługa błędów
├── main.tsx                   # Punkt wejścia (NIE MODYFIKUJ)
├── main.css                   # Główny CSS (NIE MODYFIKUJ)
├── index.css                  # Niestandardowe style i kolory
│
├── components/                # Komponenty React
│   ├── ui/                    # Shadcn UI (gotowe komponenty)
│   ├── AddInvoiceDialog.tsx   # Dialog dodawania faktury
│   ├── EditInvoiceDialog.tsx  # Dialog edycji faktury
│   ├── InvoiceCard.tsx        # Karta faktury
│   ├── FuelCard.tsx           # Karta tankowania
│   ├── DriverCard.tsx         # Karta kierowcy
│   ├── FinancialSummary.tsx   # Podsumowanie finansowe
│   ├── ReportGenerator.tsx    # Generator raportów
│   ├── ThemeToggle.tsx        # Przełącznik motywu
│   └── ...                    # Inne komponenty
│
├── hooks/                     # Custom React hooks
│   ├── use-mobile.ts          # Hook responsywności
│   ├── use-auto-reports.ts    # Hook automatycznych raportów
│   └── use-activity-monitor.ts # Hook monitorowania aktywności
│
├── lib/                       # Biblioteki i utilities
│   ├── types.ts               # TypeScript typy
│   ├── utils.ts               # Funkcje pomocnicze
│   ├── export.ts              # Funkcje eksportu
│   └── performance.ts         # Monitorowanie wydajności
│
└── styles/                    # Style CSS
    └── theme.css              # Motyw aplikacji
```

## 🎨 Kolory i Motywy

Kolory są zdefiniowane w `src/index.css` używając formatu **oklch**.

### Główne zmienne:
- `--background` - Tło strony
- `--foreground` - Kolor tekstu
- `--primary` - Główny kolor akcji
- `--secondary` - Kolor drugorzędny
- `--accent` - Kolor akcentu
- `--muted` - Przygaszony kolor
- `--destructive` - Kolor dla akcji destrukcyjnych
- `--success` - Kolor sukcesu
- `--warning` - Kolor ostrzeżenia

## 📦 Główne Komponenty

### App.tsx
Główny komponent zawierający:
- Stan aplikacji (faktury, paliwo, kierowcy)
- Logikę biznesową
- Routing między zakładkami
- Zarządzanie dialogami

### Dialogi
- `AddInvoiceDialog` - Dodawanie nowych faktur
- `EditInvoiceDialog` - Edycja istniejących faktur
- `AddFuelDialog` - Dodawanie tankowań
- `AddVehicleDialog` - Dodawanie pojazdów
- `AddDriverDialog` - Dodawanie kierowców
- `PaymentConfirmationDialog` - Potwierdzenie płatności
- `CompanyDetailsDialog` - Szczegóły firmy

### Karty
- `InvoiceCard` - Wyświetlanie pojedynczej faktury
- `FuelCard` - Wyświetlanie pojedynczego tankowania
- `DriverCard` - Wyświetlanie kierowcy

### Zakładki
- `BalanceTab` - Analiza bilansowa
- `DriversTab` - Zarządzanie kierowcami
- Inne zakładki bezpośrednio w App.tsx

### Narzędzia
- `ReportGenerator` - Generowanie raportów PDF
- `ExportInvoicesButton` - Eksport faktur do CSV
- `ExportFuelButton` - Eksport tankowań do CSV
- `ExportAllButton` - Eksport wszystkiego
- `ThemeToggle` - Przełącznik trybu jasny/ciemny
- `NotificationBanner` - Powiadomienia o terminach

## 🗄️ Zarządzanie Danymi

Aplikacja używa `useKV` hook z `@github/spark/hooks` do przechowywania danych lokalnie.

### Główne klucze KV:
- `invoices` - Tablica faktur
- `companies` - Słownik firm (klucz: NIP)
- `fuelEntries` - Tablica tankowań
- `vehicles` - Tablica pojazdów
- `drivers` - Tablica kierowców
- `dataInitialized` - Czy dane przykładowe zostały załadowane

## 🔧 Funkcje Pomocnicze (lib/utils.ts)

- `formatCurrency(amount)` - Formatuje kwotę do PLN
- `formatNIP(nip)` - Formatuje NIP do XXX-XXX-XX-XX
- `validateNIP(nip)` - Walidacja numeru NIP
- `formatDate(date)` - Formatuje datę do dd.mm.yyyy
- `calculateScore(paidOnTime)` - Oblicza punkty firmy
- `isOverdue(deadline)` - Sprawdza czy termin minął
- `calculateDistance(from, to)` - Oblicza dystans (LLM)
- `formatPhoneNumber(phone)` - Formatuje numer telefonu

## 📊 Typy TypeScript (lib/types.ts)

### Główne typy:
```typescript
interface Invoice {
  id: string
  companyName: string
  nip: string
  amount: number
  deadline: string
  isPaid: boolean
  // ... więcej pól
}

interface FuelEntry {
  id: string
  vehicleId: string
  date: string
  amount: number
  liters: number
  // ... więcej pól
}

interface Vehicle {
  id: string
  brand: string
  model: string
  // ... więcej pól
}

interface Driver {
  id: string
  name: string
  phone: string
  // ... więcej pól
}
```

## 🎯 Najważniejsze Funkcjonalności

### Dodawanie Faktury
1. Użytkownik klika "Dodaj fakturę"
2. Otwiera się `AddInvoiceDialog`
3. Po wypełnieniu formularza wywoływane jest `handleAddInvoice`
4. Nowa faktura dodawana do `invoices` przez `setInvoices`
5. Aktualizowana jest również lista firm `companies`

### Rejestrowanie Tankowania
1. Użytkownik klika "Dodaj tankowanie"
2. Otwiera się `AddFuelDialog`
3. Po wypełnieniu wywoływane jest `handleAddFuel`
4. Automatycznie obliczane jest spalanie (jeśli możliwe)
5. Tankowanie dodawane do `fuelEntries`

### Generowanie Raportów
1. Użytkownik klika "Generuj raport"
2. `ReportGenerator` zbiera dane z wybranego okresu
3. Używa LLM (spark.llm) do analizy
4. Generuje PDF używając jsPDF

## 🚀 Rozwój Aplikacji

### Dodawanie Nowej Funkcji

1. **Dodaj typ w `lib/types.ts`** (jeśli potrzebny)
2. **Dodaj stan w `App.tsx`** używając `useKV`
3. **Stwórz komponent** w `components/`
4. **Dodaj funkcję obsługi** w `App.tsx`
5. **Podłącz do UI** w odpowiedniej zakładce

### Przykład - Dodanie nowego pola do faktury:

```typescript
// 1. Zaktualizuj typ w lib/types.ts
interface Invoice {
  // ... istniejące pola
  nowePoле: string  // dodaj nowe pole
}

// 2. Zaktualizuj AddInvoiceDialog.tsx
// Dodaj input dla nowego pola

// 3. Zaktualizuj handleAddInvoice w App.tsx
const newInvoice: Invoice = {
  // ... istniejące pola
  nowePoле: data.nowePoле
}

// 4. Zaktualizuj InvoiceCard.tsx
// Wyświetl nowe pole
```

## 📝 Best Practices

1. **Zawsze używaj `useKV` dla danych które muszą przetrwać** między sesjami
2. **Używaj functional updates** dla `setInvoices`, `setFuelEntries`, itp.
   ```typescript
   // ❌ ŹLE
   setInvoices([...invoices, newInvoice])
   
   // ✅ DOBRZE
   setInvoices(current => [...current, newInvoice])
   ```
3. **Waliduj dane** przed zapisaniem
4. **Używaj toast** do informowania użytkownika o akcjach
5. **Loguj aktywność** używając `logActivity` z `use-activity-monitor`

## 🔍 Debugowanie

### Sprawdzanie danych w KV:
```typescript
// W konsoli przeglądarki (F12)
await spark.kv.keys()  // Pokaż wszystkie klucze
await spark.kv.get('invoices')  // Pokaż faktury
```

### Resetowanie danych:
```typescript
// W konsoli przeglądarki
await spark.kv.delete('invoices')
await spark.kv.delete('dataInitialized')
// Odśwież stronę
```

## 📚 Więcej Informacji

- Dokumentacja użytkownika: `README_PL.md`
- FAQ: `FAQ.txt`
- Wsparcie: gadowskispzoo@gmail.com

---

**© 2024 Gadowski sp. z o.o.**
