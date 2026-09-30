from typing import Dict, Any, List
from sqlalchemy import extract, func
from models import db, Budget, Expense, ExpenseCategory

class BudgetService:
    """Service to handle monthly planned budgets vs actual expenditures."""

    @staticmethod
    def get_budget_performance(user_id: int, month: int, year: int) -> Dict[str, Any]:
        """
        Calculates category-wise planned vs actual spending and overall budget health.
        """
        # Fetch all defined budgets for user, month, and year
        budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()
        categories = ExpenseCategory.query.filter_by(user_id=user_id).all()

        category_map = {c.id: c.name for c in categories}
        performance_list: List[Dict[str, Any]] = []

        total_planned = 0.0
        total_spent_on_budgeted = 0.0
        overbudget_count = 0

        # Create mapping of planned amounts by category_id
        budget_dict = {b.category_id: (b.id, b.planned_amount) for b in budgets}

        for cat in categories:
            cat_id = cat.id
            cat_name = cat.name
            budget_id, planned = budget_dict.get(cat_id, (None, 0.0))

            # If user has no explicit budget for this month but set category monthly_limit, fall back to limit
            if planned == 0.0 and cat.monthly_limit and cat.monthly_limit > 0:
                planned = float(cat.monthly_limit)

            # Query actual expenses in this category for this month
            actual_res = (
                db.session.query(func.coalesce(func.sum(Expense.amount), 0.0))
                .filter(
                    Expense.user_id == user_id,
                    Expense.category_id == cat_id,
                    extract("month", Expense.date) == month,
                    extract("year", Expense.date) == year
                )
                .scalar()
            )
            actual = float(actual_res or 0.0)

            if planned > 0 or actual > 0:
                diff = planned - actual
                remaining = max(0.0, diff)
                percent_used = round((actual / planned * 100), 1) if planned > 0 else 100.0
                is_over_budget = (planned > 0 and actual > planned) or (planned == 0 and actual > 0)

                if is_over_budget:
                    overbudget_count += 1

                total_planned += planned
                total_spent_on_budgeted += actual

                performance_list.append({
                    "budget_id": budget_id,
                    "category_id": cat_id,
                    "category_name": cat_name,
                    "planned": planned,
                    "actual": actual,
                    "difference": diff,
                    "remaining": remaining,
                    "percent_used": percent_used,
                    "is_over_budget": is_over_budget
                })

        overall_percent = round((total_spent_on_budgeted / total_planned * 100), 1) if total_planned > 0 else 0.0

        return {
            "month": month,
            "year": year,
            "total_planned": total_planned,
            "total_actual": total_spent_on_budgeted,
            "remaining": max(0.0, total_planned - total_spent_on_budgeted),
            "overall_percent_used": overall_percent,
            "overbudget_count": overbudget_count,
            "categories": performance_list
        }
