"""
Formatters for various data types
Matches React utils.ts formatting functions
"""


def format_currency(amount: float) -> str:
    """Format amount as PLN currency"""
    return f"{amount:,.2f} PLN".replace(",", " ")


def format_nip(nip: str) -> str:
    """Format NIP number (XXX-XXX-XX-XX or XXX-XX-XX-XXX)"""
    # Remove all non-digits
    digits = ''.join(c for c in nip if c.isdigit())
    
    if len(digits) != 10:
        return nip  # Return as-is if invalid length
    
    # Format as XXX-XXX-XX-XX
    return f"{digits[0:3]}-{digits[3:6]}-{digits[6:8]}-{digits[8:10]}"


def format_phone(phone: str) -> str:
    """Format phone number"""
    # Remove all non-digits
    digits = ''.join(c for c in phone if c.isdigit())
    
    if len(digits) == 9:
        # Polish mobile: XXX XXX XXX
        return f"{digits[0:3]} {digits[3:6]} {digits[6:9]}"
    elif len(digits) == 11 and digits.startswith('48'):
        # With country code: +48 XXX XXX XXX
        return f"+48 {digits[2:5]} {digits[5:8]} {digits[8:11]}"
    else:
        return phone  # Return as-is if unrecognized format


def format_date(date_str: str, format_type: str = "short") -> str:
    """Format ISO date string to human-readable format"""
    from datetime import datetime
    
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        return date_str
    
    if format_type == "short":
        return dt.strftime("%d.%m.%Y")
    elif format_type == "long":
        return dt.strftime("%d %B %Y")
    elif format_type == "datetime":
        return dt.strftime("%d.%m.%Y %H:%M")
    else:
        return dt.strftime("%Y-%m-%d")


def format_distance(km: float) -> str:
    """Format distance in kilometers"""
    return f"{km:,.0f} km".replace(",", " ")


def format_liters(liters: float) -> str:
    """Format fuel volume in liters"""
    return f"{liters:.2f} L"


def truncate_text(text: str, max_length: int = 50) -> str:
    """Truncate text to max length with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def format_percentage(value: float) -> str:
    """Format percentage"""
    return f"{value:.1f}%"


def format_company_name(name: str, max_length: int = 30) -> str:
    """Format company name (uppercase first letters, truncate if too long)"""
    formatted = name.title()
    return truncate_text(formatted, max_length)
