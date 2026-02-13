#!/bin/bash

# Instalator dla macOS - System Faktur Gadowski

clear
echo "========================================================"
echo "  INSTALATOR SYSTEMU FAKTUR GADOWSKI - macOS"
echo "========================================================"
echo ""
echo "Ten skrypt zainstaluje i uruchomi aplikacje."
echo ""
read -p "Nacisnij ENTER aby kontynuowac..."

# Krok 1: Sprawdz curl (domyslnie w macOS)
echo ""
echo "Krok 1/4: Sprawdzam curl..."
if ! command -v curl &> /dev/null; then
    echo "BLAD: curl nie jest dostepny!"
    echo "curl powinien byc zainstalowany domyslnie w macOS."
    echo "Zainstaluj curl i uruchom ponownie."
    exit 1
fi
echo "OK - curl zainstalowany: $(curl --version | head -n1)"

# Krok 2: Sprawdz/zainstaluj Node.js
echo ""
echo "Krok 2/4: Sprawdzam Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js nie jest zainstalowane!"
    echo ""
    echo "Instaluje Node.js przez Homebrew..."
    echo ""
    
    # Sprawdz Homebrew
    if ! command -v brew &> /dev/null; then
        echo "Homebrew nie jest zainstalowany. Instaluje Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Dodaj brew do PATH
        if [ -f /opt/homebrew/bin/brew ]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        
        if ! command -v brew &> /dev/null; then
            echo "BLAD: Nie udalo sie zainstalowac Homebrew!"
            echo "Zainstaluj Node.js recznie z: https://nodejs.org/"
            exit 1
        fi
    fi
    
    # Zainstaluj Node.js
    echo "Instaluje Node.js..."
    brew install node
    
    # Sprawdz czy instalacja sie udala
    if ! command -v node &> /dev/null; then
        echo "BLAD: Nie udalo sie zainstalowac Node.js!"
        echo "Zainstaluj recznie z: https://nodejs.org/"
        exit 1
    fi
fi
echo "OK - Node.js zainstalowany: $(node -v)"

# Krok 3: Instaluj pakiety
echo ""
echo "Krok 3/4: Instaluje pakiety (moze trwac kilka minut)..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "BLAD podczas instalacji pakietow!"
    echo "Sprawdz powyzsze komunikaty."
    echo ""
    read -p "Nacisnij ENTER aby zamknac..."
    exit 1
fi
echo ""
echo "OK - Pakiety zainstalowane"

# Krok 4: Uruchom aplikacje
echo ""
echo "Krok 4/4: Uruchamiam aplikacje..."
echo ""
echo "Aplikacja bedzie dostepna pod adresem:"
echo "http://localhost:5174"
echo ""
echo "Otwiera sie automatycznie w przegladarce za 3 sekundy..."
echo ""
sleep 3

# Otwierz w przegladarce
open http://localhost:5174

echo ""
echo "Aplikacja dziala. NIE ZAMYKAJ tego okna!"
echo "Aby zatrzymac aplikacje, nacisnij CTRL+C"
echo ""
npm run dev
