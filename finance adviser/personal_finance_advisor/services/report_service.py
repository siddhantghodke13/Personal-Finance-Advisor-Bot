from datetime import datetime
from typing import Dict, Any
from models import db, MonthlyReport
from .finance_service import FinanceService
from .budget_service import BudgetService

class ReportService:
    """Service to generate, cache, and structure comprehensive monthly financial reports."""

    @staticmethod
    def generate_or_get_monthly_report(user_id: int, month: int, year: int) -> Dict[str, Any]:
        """
        Calculates monthly aggregates, saves or updates the MonthlyReport snapshot,
        and compiles observations and recommendations.
        """
        summary = FinanceService.get_monthly_summary(user_id, month, year)
        categories = FinanceService.get_category_spending(user_id, month, year)
        budget_perf = BudgetService.get_budget_performance(user_id, month, year)
        comparison = FinanceService.get_monthly_comparison(user_id, month, year)

        # Update or create MonthlyReport model instance in DB
        report_record = MonthlyReport.query.filter_by(
            user_id=user_id, month=month, year=year
        ).first()

        if not report_record:
            report_record = MonthlyReport(
                user_id=user_id,
                month=month,
                year=year,
                total_income=summary["total_income"],
                total_expenses=summary["total_expenses"],
                total_savings=summary["total_savings"],
                savings_rate=summary["savings_rate"],
                generated_at=datetime.utcnow()
            )
            db.session.add(report_record)
        else:
            report_record.total_income = summary["total_income"]
            report_record.total_expenses = summary["total_expenses"]
            report_record.total_savings = summary["total_savings"]
            report_record.savings_rate = summary["savings_rate"]
            report_record.generated_at = datetime.utcnow()

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()

        # Generate financial observations based on actual data
        top_category = categories[0] if categories and categories[0]["spent"] > 0 else None
        observations = []

        if summary["total_income"] > 0:
            if summary["savings_rate"] >= 20:
                observations.append(f"Excellent savings discipline! You maintained a {summary['savings_rate']}% savings rate this month.")
            elif summary["savings_rate"] > 0:
                observations.append(f"Your savings rate is {summary['savings_rate']}%. Aiming for 20% would strengthen your financial resilience.")
            else:
                observations.append("Expenses met or exceeded total income this month, resulting in 0% savings.")
        else:
            observations.append("No income was recorded for this period.")

        if top_category:
            observations.append(f"Your highest spending area was '{top_category['category_name']}', accounting for ₹{top_category['spent']:,.2f} ({top_category['percent_of_total']}% of total expenses).")

        if budget_perf["overbudget_count"] > 0:
            observations.append(f"You exceeded your planned budget in {budget_perf['overbudget_count']} category/categories.")

        if comparison["has_previous_data"] and comparison["expense_change_pct"] is not None:
            direction = "increased" if comparison["expense_change_pct"] > 0 else "decreased"
            observations.append(f"Overall monthly expenses {direction} by {abs(comparison['expense_change_pct'])}% compared with the previous month.")

        # Data-driven recommendations
        recommendations = []
        if top_category and top_category["spent"] > 5000:
            potential_saving = round(top_category["spent"] * 0.15, 0)
            recommendations.append(f"Targeting a 15% reduction in '{top_category['category_name']}' could free up ₹{potential_saving:,.0f} per month (₹{potential_saving*12:,.0f}/year).")

        if summary["remaining_balance"] > 0:
            recommendations.append(f"You have a positive surplus of ₹{summary['remaining_balance']:,.2f}. Consider contributing a portion to your emergency fund.")
        else:
            recommendations.append("Prioritize essential expenses and temporarily pause discretionary shopping until cash flow stabilizes.")

        return {
            "month": month,
            "year": year,
            "summary": summary,
            "categories": categories,
            "top_category": top_category,
            "budget_performance": budget_perf,
            "comparison": comparison,
            "observations": observations,
            "recommendations": recommendations,
            "generated_at": report_record.generated_at.strftime("%B %d, %Y %I:%M %p")
        }
