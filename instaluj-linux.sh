#!/bin/bash

# Instalator dla Linux - System Faktur Gadowski

clear
echo "========================================================"
echo "  INSTALATOR SYSTEMU FAKTUR GADOWSKI - LINUX"
echo "========================================================"
echo ""
echo "Ten skrypt zainstaluje i uruchomi aplikacje."
echo ""
read -p "Nacisnij ENTER aby kontynuowac..."

# Krok 1: Sprawdz/zainstaluj curl
echo ""
echo "Krok 1/4: Sprawdzam curl..."
if ! command -v curl &> /dev/null; then
    echo "curl nie jest zainstalowany. Instaluje..."
    echo ""
    
    # Wykryj dystrybucje
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "Wykryto Debian/Ubuntu - uzywam apt"
        sudo apt-get update
        sudo apt-get install -y curl
    elif [ -f /etc/redhat-release ]; then
        # Fedora/RHEL/CentOS
        echo "Wykryto Fedora/RHEL - uzywam dnf/yum"
        if command -v dnf &> /dev/null; then
            sudo dnf install -y curl
        else
            sudo yum install -y curl
        fi
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        echo "Wykryto Arch Linux - uzywam pacman"
        sudo pacman -S --noconfirm curl
    else
        echo "BLAD: Nieznana dystrybucja!"
        echo "Zainstaluj curl recznie i uruchom ponownie."
        exit 1
    fi
    
    # Sprawdz czy instalacja sie udala
    if ! command -v curl &> /dev/null; then
        echo "BLAD: Nie udalo sie zainstalowac curl!"
        exit 1
    fi
fi
echo "OK - curl zainstalowany: $(curl --version | head -n1)"

# Krok 2: Sprawdz/zainstaluj Node.js
echo ""
echo "Krok 2/4: Sprawdzam Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js nie jest zainstalowane!"
    echo ""
    echo "Aby zainstalowac Node.js:"
    echo "1. Debian/Ubuntu: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "2. Fedora: sudo dnf install nodejs"
    echo "3. Arch: sudo pacman -S nodejs npm"
    echo ""
    echo "LUB pobierz z: https://nodejs.org/"
    echo ""
    read -p "Nacisnij ENTER aby zamknac..."
    exit 1
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
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5174 &> /dev/null &
elif command -v firefox &> /dev/null; then
    firefox http://localhost:5174 &> /dev/null &
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:5174 &> /dev/null &
fi

echo ""
echo "Aplikacja dziala. NIE ZAMYKAJ tego okna!"
echo "Aby zatrzymac aplikacje, nacisnij CTRL+C"
echo ""
npm run dev
