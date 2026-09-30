from datetime import date, datetime
from typing import Dict, Any, List
from sqlalchemy import extract, func
from models import db, Income, Expense, ExpenseCategory, Savings, User

class FinanceService:
    """Service handling financial calculations, metrics, comparisons, and health indicators."""

    @staticmethod
    def get_monthly_summary(user_id: int, month: int, year: int) -> Dict[str, Any]:
        """
        Calculate total income, total expenses, remaining balance, savings,
        savings rate, and expense ratio for a given month and year.
        Formulae:
          Remaining Balance = Total Income - Total Expenses
          Savings Rate = (Total Savings / Total Income) * 100
          Expense Ratio = (Total Expenses / Total Income) * 100
        """
        # Sum of income for the month
        total_income_res = (
            db.session.query(func.coalesce(func.sum(Income.amount), 0.0))
            .filter(
                Income.user_id == user_id,
                extract("month", Income.date) == month,
                extract("year", Income.date) == year
            )
            .scalar()
        )
        total_income = float(total_income_res or 0.0)

        # Sum of expenses for the month
        total_expenses_res = (
            db.session.query(func.coalesce(func.sum(Expense.amount), 0.0))
            .filter(
                Expense.user_id == user_id,
                extract("month", Expense.date) == month,
                extract("year", Expense.date) == year
            )
            .scalar()
        )
        total_expenses = float(total_expenses_res or 0.0)

        # Total savings contributions recorded this month
        total_savings_res = (
            db.session.query(func.coalesce(func.sum(Savings.amount), 0.0))
            .filter(
                Savings.user_id == user_id,
                extract("month", Savings.date) == month,
                extract("year", Savings.date) == year
            )
            .scalar()
        )
        total_savings = float(total_savings_res or 0.0)

        # If no specific savings recorded this month, default savings to max(0, total_income - total_expenses)
        effective_savings = total_savings if total_savings > 0 else max(0.0, total_income - total_expenses)

        remaining_balance = total_income - total_expenses

        # Safe division for ratios
        savings_rate = round((effective_savings / total_income * 100), 1) if total_income > 0 else 0.0
        expense_ratio = round((total_expenses / total_income * 100), 1) if total_income > 0 else 0.0

        return {
            "month": month,
            "year": year,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "remaining_balance": remaining_balance,
            "total_savings": effective_savings,
            "savings_rate": savings_rate,
            "expense_ratio": expense_ratio
        }

    @staticmethod
    def get_category_spending(user_id: int, month: int, year: int) -> List[Dict[str, Any]]:
        """
        Retrieve category-wise spending for the specified month,
        including monthly limit and percentage consumed.
        """
        categories = ExpenseCategory.query.filter_by(user_id=user_id).all()
        results = []

        total_expenses_res = (
            db.session.query(func.coalesce(func.sum(Expense.amount), 0.0))
            .filter(
                Expense.user_id == user_id,
                extract("month", Expense.date) == month,
                extract("year", Expense.date) == year
            )
            .scalar()
        )
        total_month_expenses = float(total_expenses_res or 0.0)

        for cat in categories:
            cat_spent_res = (
                db.session.query(func.coalesce(func.sum(Expense.amount), 0.0))
                .filter(
                    Expense.user_id == user_id,
                    Expense.category_id == cat.id,
                    extract("month", Expense.date) == month,
                    extract("year", Expense.date) == year
                )
                .scalar()
            )
            spent = float(cat_spent_res or 0.0)
            limit = float(cat.monthly_limit or 0.0)
            remaining = max(0.0, limit - spent) if limit > 0 else 0.0
            percent_of_limit = round((spent / limit * 100), 1) if limit > 0 else 0.0
            percent_of_total = round((spent / total_month_expenses * 100), 1) if total_month_expenses > 0 else 0.0
            is_over_limit = (limit > 0) and (spent > limit)

            results.append({
                "category_id": cat.id,
                "category_name": cat.name,
                "spent": spent,
                "monthly_limit": limit,
                "remaining": remaining,
                "percent_used": percent_of_limit,
                "percent_of_total": percent_of_total,
                "is_over_limit": is_over_limit
            })

        # Sort by highest spending first
        results.sort(key=lambda x: x["spent"], reverse=True)
        return results

    @staticmethod
    def get_monthly_comparison(user_id: int, current_month: int, current_year: int) -> Dict[str, Any]:
        """
        Compare current month spending and income with previous month.
        Only generates meaningful metrics when previous data exists.
        """
        # Determine previous month & year
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year

        curr_summary = FinanceService.get_monthly_summary(user_id, current_month, current_year)
        prev_summary = FinanceService.get_monthly_summary(user_id, prev_month, prev_year)

        has_prev_data = (prev_summary["total_income"] > 0 or prev_summary["total_expenses"] > 0)

        def calc_change(curr, prev):
            if prev <= 0:
                return None
            return round(((curr - prev) / prev) * 100, 1)

        income_change = calc_change(curr_summary["total_income"], prev_summary["total_income"])
        expense_change = calc_change(curr_summary["total_expenses"], prev_summary["total_expenses"])
        savings_change = calc_change(curr_summary["total_savings"], prev_summary["total_savings"])

        # Category level comparison
        curr_cats = {c["category_name"]: c["spent"] for c in FinanceService.get_category_spending(user_id, current_month, current_year)}
        prev_cats = {c["category_name"]: c["spent"] for c in FinanceService.get_category_spending(user_id, prev_month, prev_year)}

        category_changes = []
        for cat_name, curr_spent in curr_cats.items():
            prev_spent = prev_cats.get(cat_name, 0.0)
            if prev_spent > 0:
                pct = round(((curr_spent - prev_spent) / prev_spent) * 100, 1)
                category_changes.append({
                    "category": cat_name,
                    "current": curr_spent,
                    "previous": prev_spent,
                    "percent_change": pct,
                    "increased": pct > 0
                })

        return {
            "has_previous_data": has_prev_data,
            "previous_month": prev_month,
            "previous_year": prev_year,
            "income_change_pct": income_change,
            "expense_change_pct": expense_change,
            "savings_change_pct": savings_change,
            "category_changes": category_changes
        }

    @staticmethod
    def get_recent_transactions(user_id: int, limit: int = 8) -> List[Dict[str, Any]]:
        """Unified list of recent income and expense transactions."""
        incomes = Income.query.filter_by(user_id=user_id).order_by(Income.date.desc(), Income.id.desc()).limit(limit).all()
        expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc(), Expense.id.desc()).limit(limit).all()

        combined = []
        for inc in incomes:
            combined.append({
                "id": f"inc-{inc.id}",
                "type": "income",
                "title": inc.source,
                "category": "Income",
                "amount": inc.amount,
                "date": inc.date.strftime("%Y-%m-%d"),
                "description": inc.description or "",
                "payment_method": "Direct Deposit"
            })

        for exp in expenses:
            combined.append({
                "id": f"exp-{exp.id}",
                "type": "expense",
                "title": exp.category_rel.name if exp.category_rel else "Expense",
                "category": exp.category_rel.name if exp.category_rel else "Expense",
                "amount": exp.amount,
                "date": exp.date.strftime("%Y-%m-%d"),
                "description": exp.description or "",
                "payment_method": exp.payment_method or "UPI"
            })

        # Sort by date descending
        combined.sort(key=lambda x: x["date"], reverse=True)
        return combined[:limit]

    @staticmethod
    def get_financial_health(user_id: int, month: int, year: int) -> Dict[str, Any]:
        """
        Calculate educational financial health status: 'Good', 'Needs Attention', or 'High Spending'.
        Provides clear, constructive explanations without sounding like a medical diagnosis.
        """
        summary = FinanceService.get_monthly_summary(user_id, month, year)
        income = summary["total_income"]
        expenses = summary["total_expenses"]
        savings_rate = summary["savings_rate"]

        if income == 0 and expenses == 0:
            return {
                "status": "Needs Attention",
                "color": "warning",
                "badge": "No Data Yet",
                "savings_rate": 0.0,
                "expense_ratio": 0.0,
                "explanation": "No financial records found for this month. Start by adding your income and expenses to evaluate your financial health."
            }

        expense_ratio = summary["expense_ratio"]

        if expense_ratio > 90:
            status = "High Spending"
            color = "danger"
            explanation = f"Your expenses take up {expense_ratio}% of your income. Consider curbing discretionary spending to leave room for savings."
        elif savings_rate >= 20:
            status = "Good"
            color = "success"
            explanation = f"You are currently saving {savings_rate}% of your monthly income. This exceeds the recommended 20% benchmark."
        elif savings_rate >= 10:
            status = "Moderate"
            color = "primary"
            explanation = f"Your savings rate is {savings_rate}%. You are in positive territory, but could optimize non-essential categories to reach 20%."
        else:
            status = "Needs Attention"
            color = "warning"
            explanation = f"Your savings rate is {savings_rate}%. Expenses are consuming the majority of your cash flow."

        return {
            "status": status,
            "color": color,
            "savings_rate": savings_rate,
            "expense_ratio": expense_ratio,
            "explanation": explanation
        }
