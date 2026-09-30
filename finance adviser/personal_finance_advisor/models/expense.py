from datetime import datetime, date
from . import db

class Expense(db.Model):
    """User expense transaction record."""
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("expense_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=date.today, nullable=False)
    description = db.Column(db.String(255), default="")
    payment_method = db.Column(db.String(50), default="UPI")  # Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "category_name": self.category_rel.name if self.category_rel else "Uncategorized",
            "amount": self.amount,
            "date": self.date.strftime("%Y-%m-%d") if self.date else "",
            "description": self.description or "",
            "payment_method": self.payment_method or "UPI"
        }

    def __repr__(self):
        return f"<Expense ₹{self.amount} in Cat#{self.category_id}>"
