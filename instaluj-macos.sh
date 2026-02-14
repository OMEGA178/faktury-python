#!/bin/bash
# Instalator dla macOS
# Rozwiązuje problem z Tkinter na macOS 15.x

echo "🚛 System Zarządzania Fakturami - Instalator macOS"
echo "=================================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew nie jest zainstalowany"
    echo ""
    echo "Zainstaluj Homebrew:"
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    echo "Potem uruchom ten skrypt ponownie."
    exit 1
fi

echo "✅ Homebrew zainstalowany"

# Check if Homebrew Python is installed
if ! brew list python@3.11 &> /dev/null; then
    echo "📦 Instaluję Python 3.11 przez Homebrew..."
    brew install python@3.11
else
    echo "✅ Python 3.11 zainstalowany"
fi

# Use Homebrew Python
PYTHON="/opt/homebrew/bin/python3.11"
if [ ! -f "$PYTHON" ]; then
    PYTHON="/usr/local/bin/python3.11"
fi

if [ ! -f "$PYTHON" ]; then
    echo "❌ Nie znaleziono Python 3.11 z Homebrew"
    echo "Spróbuj: brew install python@3.11"
    exit 1
fi

echo "✅ Używam: $PYTHON"
$PYTHON --version

# Create virtual environment
echo ""
echo "📦 Tworzę środowisko wirtualne..."
$PYTHON -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip
echo "📦 Aktualizuję pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Instaluję zależności..."
pip install -r requirements.txt

echo ""
echo "✅ Instalacja zakończona!"
echo ""
echo "🚀 Aby uruchomić aplikację:"
echo "   1. source venv/bin/activate"
echo "   2. python main.py"
echo ""
echo "Lub użyj: ./uruchom-macos.sh"
