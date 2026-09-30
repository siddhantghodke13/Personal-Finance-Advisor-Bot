from datetime import datetime, date
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
from flask_login import login_required, current_user
from models import db, Income

income_bp = Blueprint("income", __name__, url_prefix="/income")

INCOME_SOURCES = ["Salary", "Freelance", "Part-time", "Scholarship", "Business", "Investments", "Rental", "Other"]

@income_bp.route("/", methods=["GET"])
@login_required
def index():
    query = Income.query.filter_by(user_id=current_user.id)

    # Filtering by month and year or specific date
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)
    date_filter = request.args.get("date", "").strip()

    if date_filter:
        try:
            parsed_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(Income.date == parsed_date)
        except ValueError:
            pass
    else:
        if month:
            query = query.filter(db.extract("month", Income.date) == month)
        if year:
            query = query.filter(db.extract("year", Income.date) == year)

    incomes = query.order_by(Income.date.desc(), Income.id.desc()).all()
    total_income = sum(inc.amount for inc in incomes)

    return render_template(
        "income.html",
        incomes=incomes,
        total_income=total_income,
        sources=INCOME_SOURCES,
        selected_month=month,
        selected_year=year,
        date_filter=date_filter,
        today=date.today().strftime("%Y-%m-%d")
    )

@income_bp.route("/add", methods=["POST"])
@login_required
def add():
    source = request.form.get("source", "").strip()
    amount_str = request.form.get("amount", "").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()

    if not source or not amount_str or not date_str:
        flash("Source, amount, and date are required.", "danger")
        return redirect(url_for("income.index"))

    try:
        amount = float(amount_str)
        if amount <= 0:
            flash("Amount must be a positive number.", "danger")
            return redirect(url_for("income.index"))
        inc_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        flash("Invalid amount or date format.", "danger")
        return redirect(url_for("income.index"))

    new_income = Income(
        user_id=current_user.id,
        source=source,
        amount=amount,
        date=inc_date,
        description=description
    )
    db.session.add(new_income)
    db.session.commit()
    flash(f"Income of ₹{amount:,.2f} from '{source}' added successfully.", "success")
    return redirect(url_for("income.index"))

@income_bp.route("/edit/<int:id>", methods=["POST"])
@login_required
def edit(id):
    income = Income.query.get_or_404(id)
    if income.user_id != current_user.id:
        abort(403)

    source = request.form.get("source", "").strip()
    amount_str = request.form.get("amount", "").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()

    try:
        amount = float(amount_str)
        if amount <= 0:
            flash("Amount must be greater than zero.", "danger")
            return redirect(url_for("income.index"))
        income.amount = amount
        income.source = source
        income.date = datetime.strptime(date_str, "%Y-%m-%d").date()
        income.description = description
        db.session.commit()
        flash("Income record updated successfully.", "success")
    except ValueError:
        flash("Invalid input data.", "danger")

    return redirect(url_for("income.index"))

@income_bp.route("/delete/<int:id>", methods=["POST"])
@login_required
def delete(id):
    income = Income.query.get_or_404(id)
    if income.user_id != current_user.id:
        abort(403)

    db.session.delete(income)
    db.session.commit()
    flash("Income entry deleted successfully.", "info")
    return redirect(url_for("income.index"))
