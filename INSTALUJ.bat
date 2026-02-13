@echo off
chcp 65001 >nul
title Instalator - System Faktur Gadowski

cls
echo.
echo ========================================================
echo  INSTALATOR SYSTEMU FAKTUR GADOWSKI
echo ========================================================
echo.
echo Ten skrypt zainstaluje i uruchomi aplikacje.
echo.
pause

:: Sprawdz Node.js
echo.
echo Krok 1/3: Sprawdzam Node.js...
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo BLAD: Node.js nie jest zainstalowane!
    echo.
    echo Pobierz z: https://nodejs.org/
    echo Zainstaluj wersje LTS i uruchom ponownie ten plik.
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
echo OK - Node.js zainstalowany: %NODE_VERSION%

:: Instaluj pakiety
echo.
echo Krok 2/3: Instaluje pakiety (moze trwac kilka minut)...
echo.
npm install
if %errorLevel% neq 0 (
    echo.
    echo BLAD podczas instalacji!
    echo Sprawdz powyzsze komunikaty.
    echo.
    pause
    exit /b 1
)
echo.
echo OK - Pakiety zainstalowane

:: Uruchom aplikacje
echo.
echo Krok 3/3: Uruchamiam aplikacje...
echo.
echo.
echo Aplikacja bedzie dostepna pod adresem:
echo http://localhost:5174
echo.
echo Otwiera sie automatycznie w przegladarce za 3 sekundy...
echo.
timeout /t 3 >nul
start "" http://localhost:5174
echo.
echo Aplikacja dziala. NIE ZAMYKAJ tego okna!
echo Aby zatrzymac aplikacje, zamknij to okno.
echo.
npm run dev
