# 🚛 System Zarządzania Fakturami - Python

Profesjonalny system zarządzania fakturami przepisany z React/TypeScript na Python z GUI CustomTkinter.

## 📋 Funkcjonalności

### ✅ Zaimplementowane (~75%)

**Faktury:**
- ➕ Dodawanie faktur z pełnym formularzem (firma, NIP, kwota, termin, trasa)
- ✏️ Edycja faktur
- 📸 Zdjęcia faktur i towaru (upload + compression)
- 💰 Oznaczanie jako opłacone
- 🗑️ Usuwanie faktur
- 📊 Widok oczekujących i opłaconych
- 🔔 Powiadomienia o przeterminowanych i nadchodzących płatnościach

**Kierowcy:**
- ➕ Dodawanie kierowców (dane osobowe + pojazd)
- 🚗 Informacje o pojazdach kierowców
- 💵 Koszt dzienny kierowcy
- 🗑️ Usuwanie kierowców
- 📋 Lista wszystkich kierowców

**Tankowania:**
- ⛽ Dodawanie wpisów tankowania
- 📅 Data, stacja, litry, kwota
- 🚛 Przypisanie do kierowcy i pojazdu
- 📝 Notatki do tankowania
- 🗑️ Usuwanie wpisów
- 📊 Zestawienie tankowań

**Statystyki i Raporty:**
- 💰 Nieopłacone faktury (kwota + liczba)
- ✅ Opłacone faktury (kwota + liczba)
- ⛽ Koszty paliwa w bieżącym miesiącu
- 📊 Zysk (przychody - paliwo)
- ⏱️ Średni czas płatności
- 🎯 % płatności na czas
- 📥 Eksport PDF (raport faktur ze statystykami)
- 📊 Eksport CSV (faktury, paliwo, kierowcy)

**Interfejs:**
- 🌙 Ciemny motyw (VS Code inspired)
- 🕒 Zegar na żywo
- 🔄 Auto-refresh danych
- 🎨 Profesjonalny design
- 📱 Responsywne layouty

### 🚧 W Trakcie Implementacji (~25%)

- 📈 Tab Bilans z wykresami (matplotlib)
- 🔍 Filtry i wyszukiwanie
- 🚗 Zarządzanie pojazdami (dodawanie, edycja)
- 🏆 System punktacji firm
- 💾 Backup/Restore bazy danych
- 🖼️ Podgląd zdjęć (lightbox)
- 📧 Eksport email
- 📊 Więcej wykresów i statystyk

## 🛠️ Technologie

- **Python 3.9+**
- **CustomTkinter 5.1.3** - nowoczesne GUI
- **TinyDB 4.8.0** - lekka baza JSON
- **Pillow 9.5.0** - przetwarzanie obrazów
- **ReportLab 4.1.0** - generowanie PDF
- **Matplotlib 3.8.2** - wykresy (planned)

## 📦 Instalacja

### Windows

1. Zainstaluj Python 3.9 lub nowszy z [python.org](https://www.python.org/downloads/)

2. Sklonuj repozytorium:
```bash
git clone https://github.com/OMEGA178/faktury-python.git
cd faktury-python
```

3. Zainstaluj zależności:
```bash
pip install -r requirements.txt
```

4. Uruchom aplikację:
```bash
python main.py
```

### macOS / Linux

1. Sklonuj repozytorium:
```bash
git clone https://github.com/OMEGA178/faktury-python.git
cd faktury-python
```

2. Zainstaluj zależności:
```bash
pip3 install -r requirements.txt
```

3. Uruchom aplikację:
```bash
python3 main.py
```

## 📁 Struktura Projektu

```
faktury-python/
├── main.py                 # Punkt wejścia aplikacji
├── config.py              # Konfiguracja (kolory, ścieżki)
├── requirements.txt       # Zależności Python
├── database/
│   ├── db.py             # Handler bazy danych TinyDB
│   └── models.py         # Modele danych (Invoice, Driver, etc.)
├── gui/
│   ├── main_window.py    # Główne okno aplikacji
│   ├── components/
│   │   ├── notification_banner.py
│   │   └── financial_summary.py
│   └── dialogs/
│       ├── add_invoice_dialog.py
│       ├── edit_invoice_dialog.py
│       ├── add_driver_dialog.py
│       └── add_fuel_dialog.py
├── services/
│   └── export_service.py  # Eksport PDF/CSV
├── utils/
│   ├── formatters.py      # Formatowanie danych
│   └── validators.py      # Walidacja formularzy
└── data/
    └── database.json      # Baza danych TinyDB
```

## 🎯 Roadmap

### v1.0 (Obecna) - ~75% ✅
- [x] Pełne CRUD dla faktur
- [x] Pełne CRUD dla kierowców
- [x] Pełne CRUD dla tankowań
- [x] Powiadomienia i statystyki
- [x] Eksport PDF/CSV
- [x] Upload i kompresja zdjęć

### v1.1 (Najbliższa) - Planowane
- [ ] Tab Bilans z wykresami
- [ ] Filtry i wyszukiwanie zaawansowane
- [ ] Zarządzanie pojazdami
- [ ] System punktacji firm
- [ ] Backup/Restore

### v2.0 (Przyszłość)
- [ ] Synchronizacja Firebase (opcjonalna)
- [ ] Multi-użytkownik
- [ ] Raporty automatyczne
- [ ] API REST
- [ ] Aplikacja mobilna (Kivy?)

## 📝 Uwagi

- Aplikacja przechowuje dane lokalnie w pliku `data/database.json`
- Zdjęcia są kodowane w base64 i przechowywane w bazie
- Eksporty zapisywane są w folderze `exports/`
- Wszystkie daty w formacie ISO 8601

## 🔗 Linki

- **Oryginalna wersja React:** [system-zarzdzania-fa](https://github.com/OMEGA178/system-zarzdzania-fa)
- **Wersja C# Avalonia:** [faktury-2.0](https://github.com/OMEGA178/faktury-2.0)
- **Ta wersja Python:** [faktury-python](https://github.com/OMEGA178/faktury-python)

## 📄 Licencja

MIT License - Zobacz [LICENSE.md](LICENSE.md)

## 👨‍💻 Autor

Przepisane z React/TypeScript na Python przez GitHub Copilot CLI
