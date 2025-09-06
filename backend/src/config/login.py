import os
from dotenv import load_dotenv
from src.types.types import ICookieToken
from typing import Optional
import bcrypt
load_dotenv()

class LoginConfiguration: 
    """
    Login configuration for the admin logging in to the web application.
    """

    JWT_SECRET: str = os.getenv("JWT_SECRET", "none")
    ENCODING = "utf-8"
    ALGORITHM = "HS256"

    def __init__(self, max_age: int = 8 * 3600):   # Flask expects seconds
        """
        :param max_age: Token max age in seconds (default: 8 hours)
        """
        self.max_age = max_age

    def get_login_options(self) -> ICookieToken:
        """
        Returns cookie settings depending on environment.
        """
        node_environment = os.getenv("NODE_ENVIRONMENT", "development")

        if node_environment == "production":
            # Production: secure cookies, SameSite=None
            return {
                "httponly": True,
                "secure": True,
                "samesite": "None",
                "max_age": self.max_age
            }
        else:
            # Development: not secure, SameSite=Lax
            return {
                "httponly": True,
                "secure": False,
                "samesite": "Lax",
                "max_age": self.max_age
            }
    
    @staticmethod
    def make_account(username: str, password: str) -> None:
        password_hashed: Optional[bytes] = None
        password_decoded: Optional[str] = None
        encoding = "utf-8"


        password_hashed = bcrypt.hashpw(password.encode(encoding), bcrypt.gensalt(rounds=10))
        password_decoded = password_hashed.decode(encoding)

        print(f"Username: {username}")
        print(f"Password: {password_decoded}")


# Make an account (App doesn't have a sign-up)
# LoginConfiguration.make_account("admin", "password")