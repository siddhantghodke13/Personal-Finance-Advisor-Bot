from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(UserMixin, db.Model):
    """User account model for authentication and profile."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    monthly_income = db.Column(db.Float, default=0.0)
    financial_goal = db.Column(db.String(255), default="Build emergency fund and save 20% of monthly income")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    incomes = db.relationship("Income", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    expenses = db.relationship("Expense", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    categories = db.relationship("ExpenseCategory", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    budgets = db.relationship("Budget", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    savings = db.relationship("Savings", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    reports = db.relationship("MonthlyReport", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password: str):
        """Hash password using Werkzeug security utils."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify hashed password."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"
