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
    echo Ten instalator wymaga uprawnien administratora.
    echo Uruchamiam ponownie z uprawnieniami administratora...
    echo.
    timeout /t 2 >nul
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cls
echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALATOR SYSTEMU ZARZADZANIA FAKTURAMI GADOWSKI
echo ════════════════════════════════════════════════════════════
echo.
echo Witaj w instalatorze systemu zarzadzania fakturami!
echo.
echo Ten skrypt wykona nastepujace czynnosci:
echo  [1] Dodanie folderu aplikacji do wyjatkow Windows Defender
echo  [2] Instalacje Node.js (jesli nie jest zainstalowane)
echo  [3] Instalacje wszystkich wymaganych pakietow
echo  [4] Utworzenie skrotu na pulpicie
echo  [5] Uruchomienie aplikacji
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

:: Pobierz sciezke do folderu aplikacji
set "APP_PATH=%~dp0"
set "APP_PATH=%APP_PATH:~0,-1%"

echo.
echo [1/5] Dodawanie folderu do wyjatkow Windows Defender...
echo ────────────────────────────────────────────────────────────
powershell -Command "try { Add-MpPreference -ExclusionPath '%APP_PATH%'; exit 0 } catch { exit 1 }" 2>nul
if %errorLevel% equ 0 (
    echo OK Folder dodany do wyjatkow Windows Defender
) else (
    echo ! Nie udalo sie dodac do wyjatkow (moze byc juz dodany^)
)

echo.
echo [2/5] Sprawdzanie Node.js...
echo ────────────────────────────────────────────────────────────
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo X Node.js nie jest zainstalowane!
    echo.
    echo Aby zainstalowac Node.js:
    echo 1. Pobierz instalator z: https://nodejs.org/
    echo 2. Zainstaluj wersje LTS (Latest)
    echo 3. Uruchom ponownie ten instalator
    echo.
    echo Nacisnij dowolny klawisz aby zamknac...
    pause >nul
    exit /b 1
) else (
    for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
    echo OK Node.js jest zainstalowane: %NODE_VERSION%
)

echo.
echo [3/5] Instalowanie zaleznosci projektu...
echo ────────────────────────────────────────────────────────────
echo To moze potrawac kilka minut...
echo.
call npm install
if %errorLevel% neq 0 (
    echo.
    echo X Blad podczas instalacji pakietow!
    echo.
    echo Nacisnij dowolny klawisz aby zamknac...
    pause >nul
    exit /b 1
)
echo.
echo OK Wszystkie pakiety zostaly zainstalowane

echo.
echo [4/5] Tworzenie skrotu na pulpicie...
echo ────────────────────────────────────────────────────────────

:: Utwórz plik VBS do stworzenia skrótu
set "DESKTOP=%USERPROFILE%\Desktop"
set "VBS_FILE=%TEMP%\create_shortcut_gadowski.vbs"

:: Sprawdź czy URUCHOM.bat istnieje
if not exist "%APP_PATH%\URUCHOM.bat" (
    echo ! URUCHOM.bat nie istnieje w folderze aplikacji
    echo ! Skrot nie zostanie utworzony
    goto :skip_shortcut
)

:: Tworzenie pliku VBS
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_FILE%"
echo sLinkFile = "%DESKTOP%\System Faktur Gadowski.lnk" >> "%VBS_FILE%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_FILE%"
echo oLink.TargetPath = "%APP_PATH%\URUCHOM.bat" >> "%VBS_FILE%"
echo oLink.WorkingDirectory = "%APP_PATH%" >> "%VBS_FILE%"
echo oLink.Description = "System Zarzadzania Fakturami Gadowski" >> "%VBS_FILE%"
echo oLink.Save >> "%VBS_FILE%"

:: Uruchom skrypt VBS
cscript //nologo "%VBS_FILE%" >nul 2>&1
set VBS_RESULT=%errorLevel%
del "%VBS_FILE%" >nul 2>&1

if %VBS_RESULT% equ 0 (
    if exist "%DESKTOP%\System Faktur Gadowski.lnk" (
        echo OK Skrot utworzony na pulpicie
    ) else (
        echo ! Nie udalo sie utworzyc skrotu
    )
) else (
    echo ! Blad podczas tworzenia skrotu (kod: %VBS_RESULT%)
)

:skip_shortcut

echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALACJA ZAKONCZONA POMYSLNIE!
echo ════════════════════════════════════════════════════════════
echo.
echo OK Aplikacja jest gotowa do uzycia
echo.
echo Mozesz uruchomic aplikacje na 3 sposoby:
echo  1. Kliknij skrot "System Faktur Gadowski" na pulpicie
echo  2. Uruchom plik URUCHOM.bat w tym folderze
echo  3. Wcisnij T ponizej, aby uruchomic teraz
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p "LAUNCH=Czy uruchomic aplikacje teraz? (T/N): "
if /i "%LAUNCH%"=="T" (
    echo.
    echo [5/5] Uruchamianie aplikacji...
    echo ────────────────────────────────────────────────────────────
    echo.
    echo Aplikacja zostanie uruchomiona w przegladarce...
    echo URL: http://localhost:5174
    echo.
    echo Aby zamknac aplikacje, zamknij to okno.
    echo.
    timeout /t 3 >nul
    start "" http://localhost:5174
    call npm run dev
) else (
    echo.
    echo Mozesz uruchomic aplikacje pozniej uzywajac:
    echo - Skrotu na pulpicie
    echo - Pliku URUCHOM.bat
    echo.
    echo Nacisnij dowolny klawisz aby zamknac...
    pause >nul
)

