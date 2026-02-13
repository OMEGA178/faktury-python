@echo off
chcp 65001 >nul
title Instalator - System Zarządzania Fakturami Gadowski

:: Sprawdzenie uprawnień administratora
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ════════════════════════════════════════════════════════════
    echo  WYMAGANE UPRAWNIENIA ADMINISTRATORA
    echo ════════════════════════════════════════════════════════════
    echo.
    echo Ten instalator wymaga uprawnień administratora.
    echo Uruchamiam ponownie z uprawnieniami administratora...
    echo.
    timeout /t 2 >nul
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cls
echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALATOR SYSTEMU ZARZĄDZANIA FAKTURAMI GADOWSKI
echo ════════════════════════════════════════════════════════════
echo.
echo Witaj w instalatorze systemu zarządzania fakturami!
echo.
echo Ten skrypt wykona następujące czynności:
echo  [1] Dodanie folderu aplikacji do wyjątków Windows Defender
echo  [2] Instalację Node.js (jeśli nie jest zainstalowane)
echo  [3] Instalację wszystkich wymaganych pakietów
echo  [4] Utworzenie skrótu na pulpicie
echo  [5] Uruchomienie aplikacji
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

:: Pobierz ścieżkę do folderu aplikacji
set "APP_PATH=%~dp0"
set "APP_PATH=%APP_PATH:~0,-1%"

echo.
echo [1/5] Dodawanie folderu do wyjątków Windows Defender...
echo ────────────────────────────────────────────────────────────
powershell -Command "Add-MpPreference -ExclusionPath '%APP_PATH%'" 2>nul
if %errorLevel% equ 0 (
    echo ✅ Folder dodany do wyjątków Windows Defender
) else (
    echo ⚠️  Nie udało się dodać do wyjątków (może być już dodany)
)

echo.
echo [2/5] Sprawdzanie Node.js...
echo ────────────────────────────────────────────────────────────
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js nie jest zainstalowane!
    echo.
    echo Aby zainstalować Node.js:
    echo 1. Pobierz instalator z: https://nodejs.org/
    echo 2. Zainstaluj wersję LTS (Latest)
    echo 3. Uruchom ponownie ten instalator
    echo.
    pause
    exit /b 1
) else (
    for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✅ Node.js jest zainstalowane: %NODE_VERSION%
)

echo.
echo [3/5] Instalowanie zależności projektu...
echo ────────────────────────────────────────────────────────────
echo To może potrwać kilka minut...
echo.
call npm install
if %errorLevel% neq 0 (
    echo.
    echo ❌ Błąd podczas instalacji pakietów!
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Wszystkie pakiety zostały zainstalowane

echo.
echo [4/5] Tworzenie skrótu na pulpicie...
echo ────────────────────────────────────────────────────────────

:: Utwórz plik VBS do stworzenia skrótu
set "DESKTOP=%USERPROFILE%\Desktop"
set "VBS_FILE=%TEMP%\create_shortcut.vbs"

(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%DESKTOP%\System Faktur Gadowski.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%APP_PATH%\URUCHOM.bat"
echo oLink.WorkingDirectory = "%APP_PATH%"
echo oLink.Description = "System Zarządzania Fakturami Gadowski"
echo oLink.IconLocation = "%APP_PATH%\public\favicon.ico"
echo oLink.Save
) > "%VBS_FILE%"

cscript //nologo "%VBS_FILE%"
del "%VBS_FILE%"

if exist "%DESKTOP%\System Faktur Gadowski.lnk" (
    echo ✅ Skrót utworzony na pulpicie
) else (
    echo ⚠️  Nie udało się utworzyć skrótu
)

echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALACJA ZAKOŃCZONA POMYŚLNIE!
echo ════════════════════════════════════════════════════════════
echo.
echo ✅ Aplikacja jest gotowa do użycia
echo.
echo Możesz uruchomić aplikację na 3 sposoby:
echo  1. Kliknij skrót "System Faktur Gadowski" na pulpicie
echo  2. Uruchom plik URUCHOM.bat w tym folderze
echo  3. Wciśnij Enter poniżej, aby uruchomić teraz
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p "LAUNCH=Czy uruchomić aplikację teraz? (T/N): "
if /i "%LAUNCH%"=="T" (
    echo.
    echo [5/5] Uruchamianie aplikacji...
    echo ────────────────────────────────────────────────────────────
    echo.
    echo Aplikacja zostanie uruchomiona w przeglądarce...
    echo URL: http://localhost:5174
    echo.
    echo Aby zamknąć aplikację, zamknij to okno.
    echo.
    start "" http://localhost:5174
    call npm run dev
) else (
    echo.
    echo Możesz uruchomić aplikację później używając:
    echo - Skrótu na pulpicie
    echo - Pliku URUCHOM.bat
    echo.
    pause
)
