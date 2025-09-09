import re

def neutralize_string(string: str, lower: bool = False) -> str:
    """
    Trim leading/trailing spaces, collapse multiple spaces into one,
    and optionally convert to lowercase.
    """
    # Trim and remove excess spaces
    new_string = re.sub(r"\s+", " ", string).strip()

    # Make lowercase if requested
    if lower:
        new_string = new_string.lower()

    return new_string

def capitalize_words(text: str) -> str:
    """
    Capitalizes the first letter of each word in the given string.
    
    Args:
        text (str): The input string.
    
    Returns:
        str: The string with each word capitalized.
    """
    return " ".join(word.capitalize() for word in text.split())