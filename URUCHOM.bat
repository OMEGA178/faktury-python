@echo off
chcp 65001 >nul
setlocal

echo.
echo ================================================
echo    GADOWSKI - SYSTEM FAKTUR
echo    Uruchamianie aplikacji...
echo ================================================
echo.

:: Sprawdź czy Node.js jest zainstalowany
where node >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [BŁĄD] Node.js nie jest zainstalowany!
    echo Uruchom najpierw: INSTALUJ_TUTAJ.bat jako administrator
    echo.
    pause
    exit /b 1
)

:: Sprawdź czy zainstalowano zależności
if not exist "node_modules" (
    echo [BŁĄD] Brak zainstalowanych zależności!
    echo Uruchom najpierw: INSTALUJ_TUTAJ.bat jako administrator
    echo.
    pause
    exit /b 1
)

echo [->] Uruchamianie serwera...
echo.
echo WAZNE: Nie zamykaj tego okna!
echo Aplikacja otworzy sie w przegladarce za chwile...
echo.
echo ================================================
echo.

:: Uruchom przeglądarkę po 3 sekundach
start /b timeout /t 3 /nobreak >nul && start "" http://localhost:5173

:: Uruchom serwer deweloperski
call npm run dev

pause
