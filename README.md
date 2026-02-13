# 🚛 System Zarządzania Fakturami - Gadowski sp. z o.o.

Profesjonalny system do zarządzania fakturami, finansami i rozliczeniami dla firm transportowych z automatyczną synchronizacją danych między użytkownikami.

---

## ✨ Główne funkcje

- 📄 **Zarządzanie fakturami** - dodawanie, edycja, płatności z automatycznym śledzeniem
- 👥 **Rozliczenia kierowców** - monitorowanie wypłat i bonusów
- ⛽ **Tankowania** - śledzenie kosztów paliwa i zużycia
- 🚗 **Flota pojazdów** - zarządzanie pojazdami i ich statystykami
- 📊 **Raporty finansowe** - automatyczne generowanie i wysyłka emailem
- 🔄 **Synchronizacja Firebase** - dane synchronizują się automatycznie między użytkownikami
- 💾 **Tryb offline** - aplikacja działa lokalnie, synchronizuje gdy pojawi się internet

---

## 🚀 Instalacja (Windows)

### Szybka instalacja (zalecane)

1. **Pobierz repozytorium** jako ZIP i rozpakuj
2. **Uruchom plik `INSTALUJ.bat`** (prawy przycisk → Uruchom jako administrator)
3. Instalator automatycznie:
   - ✅ Doda folder do wyjątków antywirusowych
   - ✅ Sprawdzi i zainstaluje wszystkie zależności
   - ✅ Utworzy skrót na pulpicie
   - ✅ Uruchomi aplikację

### Instalacja ręczna

```bash
# 1. Zainstaluj Node.js (https://nodejs.org/)
# 2. W folderze aplikacji wykonaj:
npm install

# 3. Uruchom aplikację
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:5174**

---

## 🔧 Wymagania systemowe

- **System operacyjny:** Windows 10/11, macOS, Linux
- **Node.js:** wersja 18 lub nowsza
- **Przeglądarka:** Chrome, Firefox, Edge (najnowsza wersja)
- **Internet:** wymagany tylko do synchronizacji danych

---

## 🔥 Konfiguracja Firebase (opcjonalne)

Firebase jest **już skonfigurowane** i działa od razu po instalacji.

Jeśli chcesz użyć własnej instancji Firebase:
1. Przeczytaj plik `FIREBASE_KONFIGURACJA.md`
2. Zmień dane w pliku `src/lib/firebase.ts`

---

## 📱 Uruchamianie

### Na Windows:
- **Kliknij skrót** na pulpicie: `System Faktur Gadowski`
- LUB uruchom: `URUCHOM.bat`

### Ręcznie:
```bash
npm run dev
```

---

## 📧 Funkcje emailowe

Raporty są automatycznie wysyłane na adres: **gadowskispzoo@gmail.com**

Przycisk **"Pobierz PDF i wyślij email"** wykonuje:
1. Generuje raport PDF
2. Wysyła email z podsumowaniem finansowym
3. Zapisuje raport lokalnie

---

## 🔒 Bezpieczeństwo

- Dane przechowywane lokalnie w przeglądarce
- Synchronizacja przez Firebase Firestore (szyfrowane połączenie)
- Profile użytkowników **NIE** synchronizują się (pozostają lokalne)
- Aplikacja działa offline - synchronizacja tylko przy dostępie do internetu

---

## 🛠️ Technologie

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS + Phosphor Icons
- **Baza danych:** Firebase Firestore (real-time sync)
- **PDF:** jsPDF + autoTable
- **Export:** CSV, Excel

---

## 📝 Licencja

Ten projekt jest własnością **Gadowski sp. z o.o.**  
Zobacz plik `LICENSE.md` dla szczegółów.

---

## 💡 Wsparcie

W razie problemów:
1. Sprawdź czy masz zainstalowany Node.js
2. Uruchom ponownie `INSTALUJ.bat`
3. Sprawdź czy port 5174 nie jest zajęty

Email: **gadowskispzoo@gmail.com**

---

**Wersja:** 2.0 (Firebase + Email Integration)  
**Ostatnia aktualizacja:** Luty 2026
