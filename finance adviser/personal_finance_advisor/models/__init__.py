from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .income import Income
from .category import ExpenseCategory
from .expense import Expense
from .budget import Budget
from .savings import Savings
from .report import MonthlyReport

__all__ = [
    "db",
    "User",
    "Income",
    "ExpenseCategory",
    "Expense",
    "Budget",
    "Savings",
    "MonthlyReport"
]
