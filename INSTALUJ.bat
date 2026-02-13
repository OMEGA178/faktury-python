@echo off
chcp 65001 >nul
title Instalator - System Faktur Gadowski

cls
echo.
echo ========================================================
echo  INSTALATOR SYSTEMU FAKTUR GADOWSKI - WINDOWS
echo ========================================================
echo.
echo Ten skrypt zainstaluje i uruchomi aplikacje.
echo.
pause

:: Sprawdz curl
echo.
echo Krok 1/4: Sprawdzam curl...
curl --version >nul 2>&1
if %errorLevel% neq 0 (
    echo OSTRZEZENIE: curl nie jest dostepny!
    echo curl jest potrzebny do instalacji Node.js.
    echo.
    echo curl powinien byc dostepny w Windows 10/11.
    echo Jesli go nie masz, pobierz z: https://curl.se/windows/
    echo.
    pause
) else (
    for /f "tokens=1,2" %%i in ('curl --version ^| findstr "curl"') do (
        echo OK - curl zainstalowany: %%i %%j
        goto :curl_ok
    )
)
:curl_ok

:: Sprawdz Node.js
echo.
echo Krok 2/4: Sprawdzam Node.js...
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
echo Krok 3/4: Instaluje pakiety (moze trwac kilka minut)...
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
echo Krok 4/4: Uruchamiam aplikacje...
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
