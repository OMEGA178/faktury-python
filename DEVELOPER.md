# 🔧 INSTRUKCJA DEVELOPERA

## Struktura Projektu (Zoptymalizowana)

### Główne pliki instalacyjne:
- **INSTALUJ_TUTAJ.bat** - Jedyny instalator potrzebny użytkownikowi
- **URUCHOM.bat** - Uruchamianie aplikacji po instalacji

### Stare pliki (ignorowane przez git):
- install.bat, install.sh, INSTALUJ.bat, WDROZ.bat - DEPRECATED
- START.bat, MENU_WDROZENIA.bat - DEPRECATED
- Wszystkie są w .gitignore

## Komendy Deweloperskie

### Instalacja (development):
```bash
npm install
```

### Uruchomienie (development):
```bash
npm run dev
```

### Build (production):
```bash
npm run build
```

### Preview buildu:
```bash
npm run preview
```

## Testowanie Instalatora

1. Skopiuj projekt na czyste środowisko Windows
2. Uruchom INSTALUJ_TUTAJ.bat jako administrator
3. Sprawdź czy wszystko się zainstalowało
4. Sprawdź czy skrót na pulpicie działa
5. Sprawdź czy aplikacja się uruchamia

## Aktualizacja Repozytorium

### Automatyczna (dla Ciebie):
```bash
# Uruchom:
WYSLIJ_DO_REPO.bat
```

### Ręczna:
```bash
git add -A
git commit -m "Opis zmian"
git push origin main
```

## Ważne Zmiany w v2.0

### Zoptymalizowano:
1. **Kolorystyka** - poprawiono kontrast w trybie jasnym
2. **Obliczenia kosztów** - uproszczona i dokładniejsza logika
3. **Instalator** - jeden plik zamiast 10+
4. **Dokumentacja** - czytelny README z przykładami
5. **Struktura** - usunięto zbędne pliki

### Poprawki:
- Koszt paliwa na km - teraz liczy realistycznie
- Tryb jasny - lepsze kolory (niebieski zamiast szarości)
- Instalacja - automatyczna z detekcją Node.js

## Monitoring i Logi

### Email raportów:
**gadowskispzoo@gmail.com**

### Co jest raportowane:
- Logowanie użytkowników (HWID + imię)
- Dodawanie faktur
- Płatności
- Tankowania
- Czas aktywności
- Zamknięcie sesji

### Jak działa:
- Hook: `use-user-tracking.ts`
- Wysyłka: Po zamknięciu aplikacji (beforeunload)
- Format: HTML email przez spark.llm API

## Backup i Export

### Formaty:
- PDF - raporty dla zarządu
- CSV - dane dla księgowości
- JSON - pełny backup (przez export all)

### Lokalizacja:
- Wszystko przechowywane w localStorage przez useKV
- Klucze: invoices, companies, fuelEntries, vehicles, drivers

## Troubleshooting

### Problem: Dane nie zapisują się
**Sprawdź:** czy używasz useKV zamiast useState dla danych persystentnych

### Problem: 0.00 w kosztach
**Sprawdź:**
1. Czy faktura ma calculatedDistance?
2. Czy kierowca ma dailyCost?
3. Czy są tankowania w ±3 dni od daty faktury?

### Problem: Instalator nie działa
**Sprawdź:**
1. Czy uruchomiony jako administrator?
2. Czy jest internet?
3. Czy Node.js się zainstalował? (node --version)

## Deployment

### Do GitHub:
```bash
git push origin main
```

### Dla użytkownika:
1. Pobierz ZIP z GitHub
2. Rozpakuj
3. Uruchom INSTALUJ_TUTAJ.bat jako admin
4. Gotowe!

## Notatki

- Nie commituj node_modules
- Nie commituj .env jeśli będzie
- Zawsze testuj instalator przed pushem
- README.md musi być aktualny
- Wersjonowanie: vX.Y (np. v2.0, v2.1)
