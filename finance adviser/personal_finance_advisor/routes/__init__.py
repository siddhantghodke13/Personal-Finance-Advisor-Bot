# Route blueprints package
from .auth import auth_bp
from .dashboard import dashboard_bp
from .income import income_bp
from .expenses import expenses_bp
from .budget import budget_bp
from .savings import savings_bp
from .reports import reports_bp
from .ai_advisor import ai_advisor_bp

__all__ = [
    "auth_bp",
    "dashboard_bp",
    "income_bp",
    "expenses_bp",
    "budget_bp",
    "savings_bp",
    "reports_bp",
    "ai_advisor_bp"
]
