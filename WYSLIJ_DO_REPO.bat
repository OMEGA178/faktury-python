@echo off
chcp 65001 >nul

echo.
echo ================================================
echo    GADOWSKI - AKTUALIZACJA REPOZYTORIUM
echo ================================================
echo.

echo [1/4] Dodawanie zmian do repozytorium...
git add -A

echo.
echo [2/4] Commitowanie zmian...
git commit -m "Optymalizacja v4.0 - Czysty system bez przykladowych danych"

echo.
echo [3/4] Wysyłanie zmian do GitHub...
git push origin main

if %errorLevel% EQU 0 (
    echo.
    echo [4/4] OK! Zmiany zostaly wyslane do repozytorium
    echo.
    echo Mozesz teraz pobrac najnowsza wersje z GitHub
) else (
    echo.
    echo [!] Wystapil blad podczas wysylania zmian
    echo Sprawdz polaczenie i uprawnienia do repozytorium
)

echo.
pause
