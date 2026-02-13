@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================
:: GADOWSKI - AUTOMATYCZNY INSTALATOR
:: Uruchom jako Administrator!
:: ============================================

echo.
echo ================================================
echo    GADOWSKI - SYSTEM FAKTUR
echo    Automatyczny Instalator Windows
echo ================================================
echo.

:: Sprawdź uprawnienia administratora
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [BŁĄD] Ten skrypt wymaga uprawnień administratora!
    echo.
    echo Kliknij prawym przyciskiem myszy na ten plik i wybierz:
    echo "Uruchom jako administrator"
    echo.
    pause
    exit /b 1
)

echo [✓] Uruchomiono z uprawnieniami administratora
echo.

:: ============================================
:: KROK 1: Sprawdź i zainstaluj Node.js
:: ============================================

echo [1/5] Sprawdzanie Node.js...
echo.

where node >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [!] Node.js nie jest zainstalowany
    echo [→] Rozpoczynam automatyczną instalację Node.js...
    echo.
    
    :: Pobierz instalator Node.js
    echo    Pobieranie Node.js v20 LTS...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'}"
    
    if not exist "%TEMP%\nodejs.msi" (
        echo [BŁĄD] Nie udało się pobrać Node.js
        echo Pobierz ręcznie z: https://nodejs.org/
        pause
        exit /b 1
    )
    
    :: Instaluj Node.js
    echo    Instalowanie Node.js...
    msiexec /i "%TEMP%\nodejs.msi" /quiet /qn /norestart
    
    :: Odśwież zmienne środowiskowe
    call refreshenv.cmd >nul 2>&1
    
    :: Dodaj Node.js do PATH dla tej sesji
    set "PATH=%PATH%;%ProgramFiles%\nodejs"
    
    echo [✓] Node.js zainstalowany
    del "%TEMP%\nodejs.msi" >nul 2>&1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [✓] Node.js jest już zainstalowany: !NODE_VERSION!
)
echo.

:: ============================================
:: KROK 2: Sprawdź npm
:: ============================================

echo [2/5] Sprawdzanie npm...
echo.

where npm >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [BŁĄD] npm nie został znaleziony
    echo Zainstaluj Node.js ręcznie z: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm jest dostępny: v!NPM_VERSION!
echo.

:: ============================================
:: KROK 3: Instalacja zależności projektu
:: ============================================

echo [3/5] Instalacja zależności projektu...
echo.

if not exist "package.json" (
    echo [BŁĄD] Brak pliku package.json
    echo Uruchom ten skrypt w głównym folderze projektu
    pause
    exit /b 1
)

echo    To może potrwać kilka minut...
echo.

:: Wyczyść cache npm dla świeżej instalacji
call npm cache clean --force >nul 2>&1

:: Instaluj zależności
call npm install --legacy-peer-deps

if %errorLevel% NEQ 0 (
    echo [BŁĄD] Instalacja zależności nie powiodła się
    echo Spróbuj ponownie lub sprawdź połączenie internetowe
    pause
    exit /b 1
)

echo.
echo [✓] Wszystkie zależności zainstalowane
echo.

:: ============================================
:: KROK 4: Czyszczenie niepotrzebnych plikow
:: ============================================

echo [4/6] Czyszczenie niepotrzebnych plikow...
echo.

:: Usun pliki instrukcyjne (nie sa potrzebne do dzialania)
if exist "CZYTAJ_MNIE.txt" del /Q "CZYTAJ_MNIE.txt" >nul 2>&1
if exist "CZYTAJ_MNIE_NAJPIERW.txt" del /Q "CZYTAJ_MNIE_NAJPIERW.txt" >nul 2>&1
if exist "FAQ.txt" del /Q "FAQ.txt" >nul 2>&1
if exist "INSTALACJA_UZYTKOWNIKA.md" del /Q "INSTALACJA_UZYTKOWNIKA.md" >nul 2>&1
if exist "INSTALATOR.md" del /Q "INSTALATOR.md" >nul 2>&1
if exist "INSTRUKCJA_GRAFICZNA.txt" del /Q "INSTRUKCJA_GRAFICZNA.txt" >nul 2>&1
if exist "INSTRUKCJA_INSTALACJI.md" del /Q "INSTRUKCJA_INSTALACJI.md" >nul 2>&1
if exist "LISTA_KONTROLNA.txt" del /Q "LISTA_KONTROLNA.txt" >nul 2>&1
if exist "README-WDROZENIE.txt" del /Q "README-WDROZENIE.txt" >nul 2>&1
if exist "README_PL.md" del /Q "README_PL.md" >nul 2>&1
if exist "README_WINDOWS.txt" del /Q "README_WINDOWS.txt" >nul 2>&1
if exist "SZYBKIE_WDROZENIE.txt" del /Q "SZYBKIE_WDROZENIE.txt" >nul 2>&1
if exist "WDROZENIE.md" del /Q "WDROZENIE.md" >nul 2>&1
if exist "WITAJ.txt" del /Q "WITAJ.txt" >nul 2>&1
if exist "ZACZNIJ_TUTAJ.txt" del /Q "ZACZNIJ_TUTAJ.txt" >nul 2>&1
if exist "PRZED_WYSLANIEM.txt" del /Q "PRZED_WYSLANIEM.txt" >nul 2>&1
if exist "src\README_DEVELOPER.md" del /Q "src\README_DEVELOPER.md" >nul 2>&1
if exist "src\lib\sample-data.ts" del /Q "src\lib\sample-data.ts" >nul 2>&1
if exist "src\lib\sample-data-60days.ts" del /Q "src\lib\sample-data-60days.ts" >nul 2>&1

echo [OK] Pliki instrukcyjne usuniete
echo.

:: ============================================
:: KROK 5: Utworzenie skrotu na pulpicie
:: ============================================

echo [5/6] Tworzenie skrotu na pulpicie...
echo.

set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Gadowski System Faktur.lnk"
set "TARGET=%~dp0URUCHOM.bat"

:: Utwórz skrypt VBS do utworzenia skrótu
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%SHORTCUT%" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%TARGET%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%~dp0" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "Gadowski System Faktur - System zarządzania fakturami" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.IconLocation = "%%SystemRoot%%\System32\imageres.dll,1" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"

cscript //nologo "%TEMP%\CreateShortcut.vbs"
del "%TEMP%\CreateShortcut.vbs"

if exist "%SHORTCUT%" (
    echo [✓] Skrót utworzony na pulpicie
) else (
    echo [!] Nie udało się utworzyć skrótu
)
echo.

:: ============================================
:: KROK 6: Uruchomienie aplikacji
:: ============================================

echo [6/6] Uruchamianie aplikacji...
echo.

echo [OK] INSTALACJA ZAKONCZONA POMYSLNIE!
echo.
echo ================================================
echo.
echo Aplikacja zostanie uruchomiona za 3 sekundy...
echo.
echo WAZNE:
echo - Na pulpicie znajdziesz skrot "Gadowski System Faktur"
echo - Uzyj go do przyszlych uruchomien aplikacji
echo - Nie zamykaj czarnego okna podczas pracy
echo.
echo ================================================
echo.

timeout /t 3 /nobreak >nul

:: Uruchom aplikację
start "" "%~dp0URUCHOM.bat"

echo.
echo Aplikacja uruchomiona!
echo Okno otworzy się automatycznie w przeglądarce.
echo.
pause
