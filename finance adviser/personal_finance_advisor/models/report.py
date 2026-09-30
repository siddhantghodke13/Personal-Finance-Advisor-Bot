from datetime import datetime
from . import db

class MonthlyReport(db.Model):
    """Snapshot table for monthly financial performance reports."""
    __tablename__ = "monthly_reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    total_income = db.Column(db.Float, default=0.0)
    total_expenses = db.Column(db.Float, default=0.0)
    total_savings = db.Column(db.Float, default=0.0)
    savings_rate = db.Column(db.Float, default=0.0)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "month", "year", name="unique_user_report_month_year"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "month": self.month,
            "year": self.year,
            "total_income": self.total_income,
            "total_expenses": self.total_expenses,
            "total_savings": self.total_savings,
            "savings_rate": self.savings_rate,
            "generated_at": self.generated_at.strftime("%Y-%m-%d %H:%M:%S")
        }

    def __repr__(self):
        return f"<MonthlyReport {self.month}/{self.year} for user {self.user_id}>"
