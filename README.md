# 🚛 System Zarządzania Fakturami - Gadowski sp. z o.o.

**Profesjonalne narzędzie pracy** dla firm transportowych do zarządzania fakturami, rozliczeniami kierowców, tankowaniami i flotą pojazdów. System z automatyczną synchronizacją danych między użytkownikami w czasie rzeczywistym.

---

## ✨ Główne funkcje

- 📄 **Zarządzanie fakturami** - dodawanie, edycja, płatności, zdjęcia faktur i towaru
- 👁️ **Podgląd zdjęć** - przeglądanie zdjęć faktur i ładunków w galerii
- 🗜️ **Automatyczna kompresja** - zdjęcia są kompresowane i bezpiecznie przechowywane
- 👥 **Rozliczenia kierowców** - monitorowanie wypłat, bonusów i kosztów
- ⛽ **Tankowania** - śledzenie kosztów paliwa i zużycia po trasach
- 🚗 **Flota pojazdów** - zarządzanie pojazdami i ich statystykami
- 📊 **Raporty finansowe** - automatyczne generowanie i wysyłka emailem (PDF)
- 🔄 **Synchronizacja Firebase** - dane synchronizują się automatycznie między użytkownikami
- 💾 **Tryb offline** - aplikacja działa lokalnie, synchronizuje gdy pojawi się internet
- 🔒 **Bezpieczne przechowywanie** - zdjęcia zapisywane w lokalnej pamięci (nie można ich przypadkowo usunąć)

---

## 🖥️ Instalacja na różnych systemach

### 🪟 **Windows 10/11**

#### ⚡ Metoda 1: Automatyczna instalacja (ZALECANE)
1. Pobierz repozytorium jako ZIP i rozpakuj
2. Kliknij prawym przyciskiem na **`INSTALUJ.bat`**
3. Wybierz **"Uruchom jako administrator"**
4. Skrót pojawi się na pulpicie

Instalator automatycznie:
- ✅ Sprawdzi i zainstaluje Node.js (jeśli potrzeba)
- ✅ Zainstaluje wszystkie zależności
- ✅ Utworzy skrót na pulpicie
- ✅ Doda folder do wyjątków Windows Defender

#### 📝 Metoda 2: Ręczna instalacja
```cmd
# 1. Zainstaluj Node.js LTS z https://nodejs.org/
# 2. Otwórz CMD w folderze aplikacji
npm install
npm run dev
```

**Aplikacja będzie dostępna pod:** http://localhost:5174

---

### 🍎 **macOS (Ventura, Sonoma i nowsze)**

#### Wymagania:
- macOS 12.0 lub nowszy
- 4GB RAM (zalecane 8GB)

#### Instalacja:

```bash
# 1. Zainstaluj Homebrew (jeśli nie masz)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Zainstaluj Node.js
brew install node

# 3. W folderze aplikacji uruchom
npm install

# 4. Uruchom aplikację
npm run dev
```

**Aplikacja będzie dostępna pod:** http://localhost:5174

**Uwaga dla macOS:** Port 5000 jest zajęty przez ControlCenter. Aplikacja używa portu **5174**.

---

### 🐧 **Linux (Ubuntu, Debian, Fedora, Arch)**

#### Ubuntu/Debian:
```bash
# 1. Zainstaluj Node.js
sudo apt update
sudo apt install nodejs npm

# 2. W folderze aplikacji
npm install
npm run dev
```

#### Fedora:
```bash
sudo dnf install nodejs npm
npm install
npm run dev
```

#### Arch Linux:
```bash
sudo pacman -S nodejs npm
npm install
npm run dev
```

**Aplikacja będzie dostępna pod:** http://localhost:5174

---

### 📱 **Android (przez Termux)**

```bash
# 1. Zainstaluj Termux z F-Droid lub Google Play
# 2. W Termux wykonaj:

pkg update && pkg upgrade
pkg install nodejs-lts git
git clone https://github.com/OMEGA178/system-zarzdzania-fa.git
cd system-zarzdzania-fa
npm install
npm run dev

# 3. Otwórz przeglądarkę i wejdź na:
# http://localhost:5174
```

**Uwaga:** Na Androidzie wymagane jest co najmniej 2GB RAM.

---

### 📱 **iOS (przez iSH Shell)**

```bash
# 1. Zainstaluj iSH Shell z App Store
# 2. W iSH wykonaj:

apk add nodejs npm git
git clone https://github.com/OMEGA178/system-zarzdzania-fa.git
cd system-zarzdzania-fa
npm install
npm run dev

# 3. Otwórz Safari i wejdź na:
# http://localhost:5174
```

**Uwaga:** iSH Shell działa wolniej niż natywne aplikacje. Zalecane iPad Pro lub iPhone 12+.

---

## 🔧 Wymagania systemowe

| System | Procesor | RAM | Dysk | Przeglądarka |
|--------|----------|-----|------|--------------|
| **Windows** | Intel/AMD 2GHz+ | 4GB | 500MB | Chrome, Edge, Firefox |
| **macOS** | Apple Silicon/Intel | 4GB | 500MB | Safari, Chrome, Firefox |
| **Linux** | x86_64 | 2GB | 500MB | Chrome, Firefox |
| **Android** | ARMv7+ | 2GB | 300MB | Chrome, Firefox |
| **iOS** | A12+ | 2GB | 300MB | Safari |

**Internet:** Wymagany tylko do synchronizacji danych (aplikacja działa offline).

---

## 🔥 Konfiguracja Firebase (opcjonalne)

Firebase jest **już skonfigurowane** i działa od razu po instalacji.

Jeśli chcesz użyć własnej instancji Firebase:
1. Przeczytaj plik `FIREBASE_KONFIGURACJA.md`
2. Zmień dane w pliku `src/lib/firebase.ts`

---

## 📱 Uruchamianie

### Windows:
- **Kliknij skrót** na pulpicie: `System Faktur Gadowski`
- LUB uruchom: `URUCHOM.bat`

### macOS/Linux/Android/iOS:
```bash
npm run dev
```

Lub utwórz alias w `.bashrc` / `.zshrc`:
```bash
alias faktury='cd ~/system-zarzdzania-fa && npm run dev'
```

---

## 📸 Zarządzanie zdjęciami faktur

### Jak dodać zdjęcia:
1. Podczas dodawania faktury kliknij **"Dodaj zdjęcia faktury"** lub **"Dodaj zdjęcia ładunku"**
2. Wybierz jedno lub więcej zdjęć (max 10MB każde)
3. Zdjęcia zostaną automatycznie skompresowane do ~80% rozmiaru
4. Zapisane bezpiecznie w pamięci lokalnej

### Jak przeglądać zdjęcia:
1. Na karcie faktury kliknij badge **"X faktura"** lub **"X ładunek"**
2. Otworzy się galeria ze zdjęciami
3. Użyj strzałek ◀️ ▶️ do nawigacji

### Gdzie są przechowywane:
- **Windows:** `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage`
- **macOS:** `~/Library/Application Support/Google/Chrome/Default/Local Storage`
- **Linux:** `~/.config/google-chrome/Default/Local Storage`
- **Android/iOS:** Pamięć aplikacji przeglądarki

**Ważne:** Zdjęcia są bezpiecznie przechowywane i nie znikną po zamknięciu przeglądarki!

---

## 📧 Funkcje emailowe

Raporty są automatycznie wysyłane na adres: **gadowskispzoo@gmail.com**

Przycisk **"Pobierz PDF i wyślij email"** wykonuje:
1. Generuje raport PDF z podsumowaniem
2. Wysyła email z analizą finansową
3. Zapisuje raport lokalnie

---

## 🔒 Bezpieczeństwo

- ✅ Dane przechowywane lokalnie w przeglądarce (IndexedDB + localStorage)
- ✅ Synchronizacja przez Firebase Firestore (szyfrowane połączenie HTTPS)
- ✅ Profile użytkowników **NIE** synchronizują się (pozostają lokalne)
- ✅ Aplikacja działa offline - synchronizacja tylko przy internecie
- ✅ Zdjęcia kompresowane i bezpiecznie przechowywane (nie można przypadkowo usunąć)
- ✅ Automatyczne backupy danych w chmurze Firebase

---

## 🛠️ Technologie

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS + Phosphor Icons
- **Baza danych:** Firebase Firestore (real-time sync)
- **PDF:** jsPDF + autoTable
- **Export:** CSV, Excel
- **Kompresja obrazów:** Canvas API + JPEG optimization

---

## 📝 Licencja

Ten projekt jest własnością **Gadowski sp. z o.o.**  
Zobacz plik `LICENSE.md` dla szczegółów.

---

## 💡 Wsparcie

### Najczęstsze problemy:

**Problem:** Port 5174 jest zajęty  
**Rozwiązanie:** Zmień port w `vite.config.ts` (linia 26)

**Problem:** Nie działa synchronizacja  
**Rozwiązanie:** Sprawdź połączenie z internetem i konfigurację Firebase

**Problem:** Zdjęcia nie ładują się  
**Rozwiązanie:** Sprawdź czy przeglądarka ma włączony localStorage

**Problem:** Aplikacja wolno działa  
**Rozwiązanie:** Wyczyść pamięć podręczną przeglądarki (Ctrl+Shift+Del)

**Kontakt:** gadowskispzoo@gmail.com

---

**Wersja:** 2.1 (Firebase + Email + Kompresja zdjęć)  
**Ostatnia aktualizacja:** Luty 2026  
**Platforma:** Cross-platform (Windows, macOS, Linux, Android, iOS)
