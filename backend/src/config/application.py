
import os
from dotenv import load_dotenv
from src.types.types import IAppConfig, ICorsOptions, IDatabaseConfig
load_dotenv()

class ApplicationConfig:
    """
    Application configuration for the backend server. This includes the backend's port and url,
    cors options, and database configurations
    """

    # Web server settings
    APPLICATION: IAppConfig = {
        "port": int(os.getenv("APP_PORT", 3000)),
        "server_url": os.getenv("SERVER_URL", "http://localhost"),
        "node_environment": os.getenv("NODE_ENVIRONMENT", "development")
    }

    # CORS settings
    CORS_OPTIONS: ICorsOptions = {
        "origin": os.getenv("FRONTEND_URL", "http://localhost:3002"),
        "credentials": True,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allowed_headers": ["Content-Type", "Authorization"]
    }

    # Database settings
    DATABASE: IDatabaseConfig = {
        "host": os.getenv("DB_HOST", "application"),
        "user": os.getenv("DB_USER", "admin"),
        "password": os.getenv("DB_PASSWORD", "password"),
        "database": os.getenv("DB_NAME", "database"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "connection_timeout": 15  # seconds
    }
