#!/bin/bash
# Uruchamianie aplikacji Python na macOS

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "❌ Środowisko wirtualne nie istnieje"
    echo "Uruchom najpierw: ./instaluj-macos.sh"
    exit 1
fi

echo "🚀 Uruchamiam aplikację..."
source venv/bin/activate
python main.py
