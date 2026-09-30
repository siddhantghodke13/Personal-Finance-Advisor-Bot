from datetime import date
from flask import Blueprint, render_template, request
from flask_login import login_required, current_user
from services import FinanceService, BudgetService
from models import Income, Expense, ExpenseCategory, Savings, Budget

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard")
@login_required
def index():
    today = date.today()
    try:
        month = int(request.args.get("month", today.month))
        year = int(request.args.get("year", today.year))
    except (ValueError, TypeError):
        month = today.month
        year = today.year

    summary = FinanceService.get_monthly_summary(current_user.id, month, year)
    category_spending = FinanceService.get_category_spending(current_user.id, month, year)
    budget_perf = BudgetService.get_budget_performance(current_user.id, month, year)
    comparison = FinanceService.get_monthly_comparison(current_user.id, month, year)
    health = FinanceService.get_financial_health(current_user.id, month, year)
    recent_transactions = FinanceService.get_recent_transactions(current_user.id, limit=8)

    # Prepare chart payloads for Chart.js
    chart_category_labels = [c["category_name"] for c in category_spending if c["spent"] > 0]
    chart_category_data = [c["spent"] for c in category_spending if c["spent"] > 0]

    budget_labels = [c["category_name"] for c in budget_perf["categories"] if c["planned"] > 0 or c["actual"] > 0]
    budget_planned = [c["planned"] for c in budget_perf["categories"] if c["planned"] > 0 or c["actual"] > 0]
    budget_actual = [c["actual"] for c in budget_perf["categories"] if c["planned"] > 0 or c["actual"] > 0]

    # Available months for selector
    months_list = [
        (1, "January"), (2, "February"), (3, "March"), (4, "April"),
        (5, "May"), (6, "June"), (7, "July"), (8, "August"),
        (9, "September"), (10, "October"), (11, "November"), (12, "December")
    ]
    years_list = [today.year - 1, today.year, today.year + 1]

    return render_template(
        "dashboard.html",
        selected_month=month,
        selected_year=year,
        months_list=months_list,
        years_list=years_list,
        summary=summary,
        category_spending=category_spending,
        budget_perf=budget_perf,
        comparison=comparison,
        health=health,
        recent_transactions=recent_transactions,
        chart_category_labels=chart_category_labels,
        chart_category_data=chart_category_data,
        budget_labels=budget_labels,
        budget_planned=budget_planned,
        budget_actual=budget_actual
    )
