"""
Faktury - System Zarządzania Fakturami
Python Desktop Application
Port from React/TypeScript to Python/CustomTkinter
"""

import os
from pathlib import Path

# App configuration
APP_NAME = "Faktury 2.0"
APP_VERSION = "2.0.0"
COMPANY_NAME = "Gadowski sp. z o.o."

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
BACKUP_DIR = DATA_DIR / "backups"
EXPORTS_DIR = DATA_DIR / "exports"
DB_PATH = DATA_DIR / "faktury.json"

# Create directories if not exist
DATA_DIR.mkdir(exist_ok=True)
BACKUP_DIR.mkdir(exist_ok=True)
EXPORTS_DIR.mkdir(exist_ok=True)

# Theme colors (Dark theme like C# version)
COLORS = {
    "bg_primary": "#1E1E1E",
    "bg_secondary": "#2D2D30",
    "bg_tertiary": "#252526",
    "border": "#3E3E42",
    "text_primary": "#E0E0E0",
    "text_secondary": "#CCCCCC",
    "text_subtle": "#AAAAAA",
    "accent_blue": "#007ACC",
    "accent_blue_hover": "#005A9E",
    "success": "#81C784",
    "warning": "#FFB74D",
    "error": "#EF5350",
    "info": "#64B5F6",
}

# Date formats
DATE_FORMAT = "%Y-%m-%d"
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
DISPLAY_DATE_FORMAT = "%d.%m.%Y"
DISPLAY_DATETIME_FORMAT = "%d.%m.%Y %H:%M"

# Validation
NIP_LENGTH = 10
PHONE_MIN_LENGTH = 9
