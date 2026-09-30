from datetime import datetime
from . import db

class ExpenseCategory(db.Model):
    """User expense categories with optional monthly limits."""
    __tablename__ = "expense_categories"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(80), nullable=False)
    monthly_limit = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    expenses = db.relationship("Expense", backref="category_rel", cascade="all, delete-orphan", lazy="dynamic")
    budgets = db.relationship("Budget", backref="category_rel", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "monthly_limit": self.monthly_limit
        }

    def __repr__(self):
        return f"<ExpenseCategory {self.name}>"
