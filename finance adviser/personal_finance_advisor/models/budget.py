from datetime import datetime
from . import db

class Budget(db.Model):
    """Monthly planned budget per category."""
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("expense_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    month = db.Column(db.Integer, nullable=False)  # 1-12
    year = db.Column(db.Integer, nullable=False)   # e.g. 2025
    planned_amount = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure one budget entry per user/category/month/year
    __table_args__ = (
        db.UniqueConstraint("user_id", "category_id", "month", "year", name="unique_user_cat_month_year"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "category_name": self.category_rel.name if self.category_rel else "General",
            "month": self.month,
            "year": self.year,
            "planned_amount": self.planned_amount
        }

    def __repr__(self):
        return f"<Budget {self.month}/{self.year} Cat#{self.category_id}: ₹{self.planned_amount}>"
