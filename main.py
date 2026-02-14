"""
Faktury 2.0 - System Zarządzania Fakturami
Main application entry point
"""

import customtkinter as ctk
from gui.main_window import MainWindow
import config

def main():
    """Main application entry"""
    # Set appearance mode and color theme
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")
    
    # Create and run app
    app = MainWindow()
    app.mainloop()

if __name__ == "__main__":
    main()
