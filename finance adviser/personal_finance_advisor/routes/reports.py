from datetime import date
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from services import ReportService, AIService, FinanceService

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")

@reports_bp.route("/", methods=["GET"])
@login_required
def index():
    today = date.today()
    try:
        month = int(request.args.get("month", today.month))
        year = int(request.args.get("year", today.year))
    except (ValueError, TypeError):
        month = today.month
        year = today.year

    report = ReportService.generate_or_get_monthly_report(current_user.id, month, year)

    # Dynamic AI recommendations if enabled
    ai_recs = AIService.generate_recommendations({
        "total_income": report["summary"]["total_income"],
        "total_expenses": report["summary"]["total_expenses"],
        "savings_rate": report["summary"]["savings_rate"],
        "category_spending": report["categories"]
    })

    months_list = [
        (1, "January"), (2, "February"), (3, "March"), (4, "April"),
        (5, "May"), (6, "June"), (7, "July"), (8, "August"),
        (9, "September"), (10, "October"), (11, "November"), (12, "December")
    ]
    years_list = [today.year - 1, today.year, today.year + 1]

    return render_template(
        "reports.html",
        report=report,
        ai_recommendations=ai_recs,
        selected_month=month,
        selected_year=year,
        months_list=months_list,
        years_list=years_list
    )

@reports_bp.route("/export-json", methods=["GET"])
@login_required
def export_json():
    today = date.today()
    month = request.args.get("month", today.month, type=int)
    year = request.args.get("year", today.year, type=int)

    report = ReportService.generate_or_get_monthly_report(current_user.id, month, year)
    return jsonify(report)
