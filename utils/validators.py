"""
Validators for form inputs
"""

import re
from datetime import datetime


def validate_nip(nip: str) -> tuple[bool, str]:
    """
    Validate Polish NIP number (10 digits)
    Returns (is_valid, error_message)
    """
    # Remove all non-digits
    digits = ''.join(c for c in nip if c.isdigit())
    
    if len(digits) != 10:
        return False, "NIP musi zawierać 10 cyfr"
    
    # NIP checksum validation
    weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    total = sum(int(digits[i]) * weights[i] for i in range(9))
    checksum = total % 11
    
    if checksum == 10:
        checksum = 0
    
    if checksum != int(digits[9]):
        return False, "Nieprawidłowa suma kontrolna NIP"
    
    return True, ""


def validate_phone(phone: str) -> tuple[bool, str]:
    """
    Validate phone number (9 digits for Polish mobile)
    Returns (is_valid, error_message)
    """
    # Remove all non-digits
    digits = ''.join(c for c in phone if c.isdigit())
    
    # Handle +48 prefix
    if digits.startswith('48') and len(digits) == 11:
        digits = digits[2:]
    
    if len(digits) != 9:
        return False, "Numer telefonu musi zawierać 9 cyfr"
    
    # Polish mobile numbers start with 4, 5, 6, 7, or 8
    if digits[0] not in '45678':
        return False, "Nieprawidłowy numer telefonu"
    
    return True, ""


def validate_email(email: str) -> tuple[bool, str]:
    """
    Validate email address
    Returns (is_valid, error_message)
    """
    if not email:
        return True, ""  # Email is optional
    
    # Simple regex for email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Nieprawidłowy format email"
    
    return True, ""


def validate_amount(amount_str: str) -> tuple[bool, str, float]:
    """
    Validate monetary amount
    Returns (is_valid, error_message, parsed_value)
    """
    try:
        amount = float(amount_str.replace(',', '.').replace(' ', ''))
    except ValueError:
        return False, "Kwota musi być liczbą", 0.0
    
    if amount <= 0:
        return False, "Kwota musi być większa od 0", 0.0
    
    if amount > 1_000_000_000:
        return False, "Kwota zbyt duża", 0.0
    
    return True, "", amount


def validate_date(date_str: str, format_str: str = "%Y-%m-%d") -> tuple[bool, str, datetime | None]:
    """
    Validate date string
    Returns (is_valid, error_message, parsed_datetime)
    """
    try:
        dt = datetime.strptime(date_str, format_str)
    except ValueError:
        return False, f"Nieprawidłowy format daty (oczekiwano {format_str})", None
    
    # Check if date is not too far in the future
    if dt.year > datetime.now().year + 10:
        return False, "Data zbyt daleka w przyszłości", None
    
    # Check if date is not too far in the past
    if dt.year < 2000:
        return False, "Data zbyt daleka w przeszłości", None
    
    return True, "", dt


def validate_payment_term(term_str: str) -> tuple[bool, str, int]:
    """
    Validate payment term in days
    Returns (is_valid, error_message, parsed_value)
    """
    try:
        term = int(term_str)
    except ValueError:
        return False, "Termin płatności musi być liczbą całkowitą", 0
    
    if term <= 0:
        return False, "Termin płatności musi być większy od 0", 0
    
    if term > 365:
        return False, "Termin płatności nie może przekraczać 365 dni", 0
    
    return True, "", term


def validate_distance(distance_str: str) -> tuple[bool, str, float]:
    """
    Validate distance in kilometers
    Returns (is_valid, error_message, parsed_value)
    """
    try:
        distance = float(distance_str.replace(',', '.').replace(' ', ''))
    except ValueError:
        return False, "Dystans musi być liczbą", 0.0
    
    if distance < 0:
        return False, "Dystans nie może być ujemny", 0.0
    
    if distance > 10_000:
        return False, "Dystans zbyt duży", 0.0
    
    return True, "", distance


def validate_liters(liters_str: str) -> tuple[bool, str, float]:
    """
    Validate fuel volume in liters
    Returns (is_valid, error_message, parsed_value)
    """
    try:
        liters = float(liters_str.replace(',', '.').replace(' ', ''))
    except ValueError:
        return False, "Liczba litrów musi być liczbą", 0.0
    
    if liters <= 0:
        return False, "Liczba litrów musi być większa od 0", 0.0
    
    if liters > 10_000:
        return False, "Liczba litrów zbyt duża", 0.0
    
    return True, "", liters


def validate_registration_number(reg_num: str) -> tuple[bool, str]:
    """
    Validate Polish vehicle registration number
    Returns (is_valid, error_message)
    """
    if not reg_num:
        return True, ""  # Optional field
    
    # Remove spaces and convert to uppercase
    reg_num = reg_num.replace(' ', '').upper()
    
    # Polish registration: 2-3 letters + 4-5 digits (simplified)
    pattern = r'^[A-Z]{2,3}[0-9A-Z]{4,5}$'
    
    if not re.match(pattern, reg_num):
        return False, "Nieprawidłowy format numeru rejestracyjnego"
    
    return True, ""
