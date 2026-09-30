import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Base application configuration class."""
    SECRET_KEY = os.getenv("SECRET_KEY", "finance-advisor-dev-super-secret-key-2025")
    
    # Database configuration (supports SQLite and PostgreSQL)
    database_url = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'finance.db')}")
    # Render and Heroku use postgres:// which SQLAlchemy 1.4+ expects as postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Currency configuration
    CURRENCY_SYMBOL = "₹"
    CURRENCY_CODE = "INR"
    
    # AI Advisor configuration
    AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Session security
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max payload
