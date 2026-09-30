from datetime import datetime, date
from . import db

class Savings(db.Model):
    """User savings goals and recorded contribution amounts."""
    __tablename__ = "savings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_name = db.Column(db.String(100), nullable=False)  # e.g., "Emergency Fund", "New Laptop", "Education", "Travel"
    goal_amount = db.Column(db.Float, nullable=False, default=0.0)
    amount = db.Column(db.Float, nullable=False, default=0.0)  # Current saved amount or contribution
    date = db.Column(db.Date, default=date.today, nullable=False)
    description = db.Column(db.String(255), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def progress_percentage(self) -> float:
        """Calculate percentage progress towards goal with safe division."""
        if self.goal_amount and self.goal_amount > 0:
            return round(min(100.0, (self.amount / self.goal_amount) * 100), 1)
        return 0.0

    @property
    def remaining_amount(self) -> float:
        """Amount remaining to hit the goal."""
        return max(0.0, self.goal_amount - self.amount)

    def to_dict(self):
        return {
            "id": self.id,
            "goal_name": self.goal_name,
            "goal_amount": self.goal_amount,
            "amount": self.amount,
            "remaining_amount": self.remaining_amount,
            "progress_percentage": self.progress_percentage,
            "date": self.date.strftime("%Y-%m-%d") if self.date else "",
            "description": self.description or ""
        }

    def __repr__(self):
        return f"<Savings {self.goal_name}: ₹{self.amount}/₹{self.goal_amount}>"
