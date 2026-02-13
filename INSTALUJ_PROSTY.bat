@echo off
chcp 65001 >nul
title Instalator Prosty - System Faktur Gadowski

cls
echo.
echo ════════════════════════════════════════════════════════════
echo  PROSTY INSTALATOR - SYSTEM FAKTUR GADOWSKI
echo ════════════════════════════════════════════════════════════
echo.
echo Ten instalator NIE wymaga uprawnien administratora
echo.
echo Wykona nastepujace czynnosci:
echo  [1] Sprawdzenie Node.js
echo  [2] Instalacje pakietow npm
echo  [3] Utworzenie skrotu na pulpicie
echo  [4] Uruchomienie aplikacji
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

:: Pobierz sciezke do folderu aplikacji
set "APP_PATH=%~dp0"
set "APP_PATH=%APP_PATH:~0,-1%"

echo.
echo [1/4] Sprawdzanie Node.js...
echo ────────────────────────────────────────────────────────────
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo X Node.js nie jest zainstalowane!
    echo.
    echo Co zrobic:
    echo 1. Pobierz: https://nodejs.org/
    echo 2. Zainstaluj wersje LTS
    echo 3. Uruchom ponownie ten instalator
    echo.
    start https://nodejs.org/
    echo.
    echo Nacisnij dowolny klawisz aby zamknac...
    pause >nul
    exit /b 1
) else (
    for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
    echo OK Node.js: %NODE_VERSION%
)

echo.
echo [2/4] Instalowanie pakietow...
echo ────────────────────────────────────────────────────────────
echo Prosze czekac, to moze potrawac 2-5 minut...
echo.
call npm install --loglevel=error
if %errorLevel% neq 0 (
    echo.
    echo X Blad instalacji pakietow!
    echo.
    echo Sprobuj:
    echo 1. Sprawdz polaczenie z internetem
    echo 2. Uruchom ponownie instalator
    echo 3. Jesli nadal nie dziala, napisz na: gadowskispzoo@gmail.com
    echo.
    echo Nacisnij dowolny klawisz aby zamknac...
    pause >nul
    exit /b 1
)
echo.
echo OK Pakiety zainstalowane

echo.
echo [3/4] Tworzenie skrotu na pulpicie...
echo ────────────────────────────────────────────────────────────

set "DESKTOP=%USERPROFILE%\Desktop"
set "VBS_FILE=%TEMP%\shortcut_gadowski_%RANDOM%.vbs"

if not exist "%APP_PATH%\URUCHOM.bat" (
    echo ! URUCHOM.bat nie znaleziony
    goto :skip_shortcut
)

:: Tworzenie skryptu VBS
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%DESKTOP%\System Faktur Gadowski.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%APP_PATH%\URUCHOM.bat"
echo oLink.WorkingDirectory = "%APP_PATH%"
echo oLink.Description = "System Faktur Gadowski - Narzedzie pracy"
echo oLink.Save
) > "%VBS_FILE%"

cscript //nologo "%VBS_FILE%" >nul 2>&1
del "%VBS_FILE%" >nul 2>&1

if exist "%DESKTOP%\System Faktur Gadowski.lnk" (
    echo OK Skrot utworzony na pulpicie
) else (
    echo ! Nie udalo sie utworzyc skrotu
    echo   Mozesz uruchomic aplikacje przez URUCHOM.bat
)

:skip_shortcut

echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALACJA ZAKONCZONA!
echo ════════════════════════════════════════════════════════════
echo.
echo OK Aplikacja jest gotowa
echo.
echo Jak uruchomic:
echo  1. Kliknij skrot "System Faktur Gadowski" na pulpicie
echo  2. Lub kliknij URUCHOM.bat w tym folderze
echo  3. Lub wcisnij T ponizej
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p "LAUNCH=Uruchomic teraz? (T/N): "
if /i "%LAUNCH%"=="T" (
    echo.
    echo [4/4] Uruchamianie...
    echo ────────────────────────────────────────────────────────────
    echo.
    echo Za chwile otworzy sie przeglad arka...
    echo URL: http://localhost:5174
    echo.
    echo ABY ZAMKNAC APLIKACJE, ZAMKNIJ TO OKNO
    echo.
    timeout /t 2 >nul
    start "" http://localhost:5174
    npm run dev
) else (
    echo.
    echo Mozesz uruchomic pozniej:
    echo - Skrot na pulpicie
    echo - URUCHOM.bat
    echo.
    echo Nacisnij dowolny klawisz...
    pause >nul
)
