from datetime import datetime, date
from . import db

class Income(db.Model):
    """User income transactions model."""
    __tablename__ = "incomes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source = db.Column(db.String(100), nullable=False)  # Salary, Freelance, Part-time, Scholarship, Business, Other
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=date.today, nullable=False)
    description = db.Column(db.String(255), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "amount": self.amount,
            "date": self.date.strftime("%Y-%m-%d") if self.date else "",
            "description": self.description or ""
        }

    def __repr__(self):
        return f"<Income {self.source}: ₹{self.amount}>"
