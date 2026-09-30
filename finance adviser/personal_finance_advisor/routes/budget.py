from datetime import date
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort, jsonify
from flask_login import login_required, current_user
from models import db, Budget, ExpenseCategory, Expense
from services import BudgetService, AIService

budget_bp = Blueprint("budget", __name__, url_prefix="/budget")

@budget_bp.route("/", methods=["GET"])
@login_required
def index():
    today = date.today()
    try:
        month = int(request.args.get("month", today.month))
        year = int(request.args.get("year", today.year))
    except (ValueError, TypeError):
        month = today.month
        year = today.year

    performance = BudgetService.get_budget_performance(current_user.id, month, year)
    categories = ExpenseCategory.query.filter_by(user_id=current_user.id).order_by(ExpenseCategory.name).all()

    months_list = [
        (1, "January"), (2, "February"), (3, "March"), (4, "April"),
        (5, "May"), (6, "June"), (7, "July"), (8, "August"),
        (9, "September"), (10, "October"), (11, "November"), (12, "December")
    ]
    years_list = [today.year - 1, today.year, today.year + 1]

    return render_template(
        "budget.html",
        performance=performance,
        categories=categories,
        selected_month=month,
        selected_year=year,
        months_list=months_list,
        years_list=years_list
    )

@budget_bp.route("/set", methods=["POST"])
@login_required
def set_budget():
    category_id = request.form.get("category_id", type=int)
    month = request.form.get("month", type=int)
    year = request.form.get("year", type=int)
    planned_amount_str = request.form.get("planned_amount", "").strip()

    if not category_id or not month or not year or not planned_amount_str:
        flash("Category, month, year, and planned amount are required.", "danger")
        return redirect(url_for("budget.index", month=month, year=year))

    category = ExpenseCategory.query.filter_by(id=category_id, user_id=current_user.id).first()
    if not category:
        flash("Invalid category.", "danger")
        return redirect(url_for("budget.index", month=month, year=year))

    try:
        planned_amount = float(planned_amount_str)
        if planned_amount < 0:
            flash("Planned amount cannot be negative.", "danger")
            return redirect(url_for("budget.index", month=month, year=year))
    except ValueError:
        flash("Invalid budget amount.", "danger")
        return redirect(url_for("budget.index", month=month, year=year))

    # Find existing or create new
    budget_entry = Budget.query.filter_by(
        user_id=current_user.id,
        category_id=category_id,
        month=month,
        year=year
    ).first()

    if budget_entry:
        budget_entry.planned_amount = planned_amount
    else:
        budget_entry = Budget(
            user_id=current_user.id,
            category_id=category_id,
            month=month,
            year=year,
            planned_amount=planned_amount
        )
        db.session.add(budget_entry)

    db.session.commit()
    flash(f"Budget for '{category.name}' set to ₹{planned_amount:,.2f}.", "success")
    return redirect(url_for("budget.index", month=month, year=year))

@budget_bp.route("/delete/<int:id>", methods=["POST"])
@login_required
def delete_budget(id):
    budget = Budget.query.get_or_404(id)
    if budget.user_id != current_user.id:
        abort(403)

    month = budget.month
    year = budget.year
    db.session.delete(budget)
    db.session.commit()
    flash("Budget allocation removed.", "info")
    return redirect(url_for("budget.index", month=month, year=year))

@budget_bp.route("/ai-generate", methods=["POST"])
@login_required
def ai_generate():
    """
    AI-powered Smart Budget generation endpoint.
    Collects user's income, expenses, categories, and goals, returns structured JSON.
    """
    today = date.today()
    month = request.json.get("month", today.month) if request.is_json else today.month
    year = request.json.get("year", today.year) if request.is_json else today.year

    # Collect user financial data
    categories = [c.name for c in ExpenseCategory.query.filter_by(user_id=current_user.id).all()]
    recent_expenses = [
        {"category": e.category_rel.name if e.category_rel else "General", "amount": e.amount}
        for e in Expense.query.filter_by(user_id=current_user.id).order_by(Expense.date.desc()).limit(15).all()
    ]

    financial_data = {
        "monthly_income": current_user.monthly_income or 50000.0,
        "financial_goal": current_user.financial_goal,
        "categories": categories,
        "recent_expenses": recent_expenses
    }

    ai_result = AIService.generate_budget(financial_data)
    return jsonify(ai_result)

@budget_bp.route("/apply-ai-budget", methods=["POST"])
@login_required
def apply_ai_budget():
    """
    Save approved AI-suggested budget items into the user's database.
    """
    month = request.form.get("month", type=int)
    year = request.form.get("year", type=int)

    if not month or not year:
        today = date.today()
        month = today.month
        year = today.year

    category_budgets = request.form.getlist("category_budget[]")
    category_names = request.form.getlist("category_name[]")

    applied_count = 0
    for name, amt_str in zip(category_names, category_budgets):
        try:
            amt = float(amt_str)
        except ValueError:
            continue

        cat = ExpenseCategory.query.filter_by(user_id=current_user.id, name=name).first()
        if not cat:
            cat = ExpenseCategory(user_id=current_user.id, name=name, monthly_limit=amt)
            db.session.add(cat)
            db.session.flush()

        budget = Budget.query.filter_by(
            user_id=current_user.id, category_id=cat.id, month=month, year=year
        ).first()

        if budget:
            budget.planned_amount = amt
        else:
            budget = Budget(
                user_id=current_user.id, category_id=cat.id, month=month, year=year, planned_amount=amt
            )
            db.session.add(budget)
        applied_count += 1

    db.session.commit()
    flash(f"Successfully applied smart budget for {applied_count} categories!", "success")
    return redirect(url_for("budget.index", month=month, year=year))
