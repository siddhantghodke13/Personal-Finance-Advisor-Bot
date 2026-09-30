from datetime import datetime, date
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
from flask_login import login_required, current_user
from models import db, Expense, ExpenseCategory

expenses_bp = Blueprint("expenses", __name__, url_prefix="/expenses")

PAYMENT_METHODS = ["UPI", "Debit Card", "Credit Card", "Cash", "Bank Transfer", "Net Banking", "Other"]

@expenses_bp.route("/", methods=["GET"])
@login_required
def index():
    query = Expense.query.filter_by(user_id=current_user.id)

    # Search & filters
    search = request.args.get("search", "").strip()
    category_id = request.args.get("category_id", type=int)
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)
    date_filter = request.args.get("date", "").strip()
    payment_method = request.args.get("payment_method", "").strip()

    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))

    if category_id:
        query = query.filter(Expense.category_id == category_id)

    if payment_method:
        query = query.filter(Expense.payment_method == payment_method)

    if date_filter:
        try:
            parsed_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(Expense.date == parsed_date)
        except ValueError:
            pass
    else:
        if month:
            query = query.filter(db.extract("month", Expense.date) == month)
        if year:
            query = query.filter(db.extract("year", Expense.date) == year)

    expenses = query.order_by(Expense.date.desc(), Expense.id.desc()).all()
    total_expenses = sum(exp.amount for exp in expenses)
    categories = ExpenseCategory.query.filter_by(user_id=current_user.id).order_by(ExpenseCategory.name).all()

    return render_template(
        "expenses.html",
        expenses=expenses,
        total_expenses=total_expenses,
        categories=categories,
        payment_methods=PAYMENT_METHODS,
        search=search,
        selected_category_id=category_id,
        selected_method=payment_method,
        selected_month=month,
        selected_year=year,
        date_filter=date_filter,
        today=date.today().strftime("%Y-%m-%d")
    )

@expenses_bp.route("/add", methods=["POST"])
@login_required
def add():
    category_id = request.form.get("category_id", type=int)
    amount_str = request.form.get("amount", "").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()
    payment_method = request.form.get("payment_method", "UPI").strip()

    if not category_id or not amount_str or not date_str:
        flash("Category, amount, and date are required.", "danger")
        return redirect(url_for("expenses.index"))

    # Verify category belongs to user
    category = ExpenseCategory.query.filter_by(id=category_id, user_id=current_user.id).first()
    if not category:
        flash("Invalid category selected.", "danger")
        return redirect(url_for("expenses.index"))

    try:
        amount = float(amount_str)
        if amount <= 0:
            flash("Amount must be greater than zero.", "danger")
            return redirect(url_for("expenses.index"))
        exp_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        flash("Invalid amount or date format.", "danger")
        return redirect(url_for("expenses.index"))

    new_expense = Expense(
        user_id=current_user.id,
        category_id=category_id,
        amount=amount,
        date=exp_date,
        description=description,
        payment_method=payment_method
    )
    db.session.add(new_expense)
    db.session.commit()
    flash(f"Expense of ₹{amount:,.2f} recorded in '{category.name}'.", "success")
    return redirect(url_for("expenses.index"))

@expenses_bp.route("/edit/<int:id>", methods=["POST"])
@login_required
def edit(id):
    expense = Expense.query.get_or_404(id)
    if expense.user_id != current_user.id:
        abort(403)

    category_id = request.form.get("category_id", type=int)
    amount_str = request.form.get("amount", "").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()
    payment_method = request.form.get("payment_method", "UPI").strip()

    category = ExpenseCategory.query.filter_by(id=category_id, user_id=current_user.id).first()
    if not category:
        flash("Invalid category selected.", "danger")
        return redirect(url_for("expenses.index"))

    try:
        amount = float(amount_str)
        if amount <= 0:
            flash("Amount must be greater than zero.", "danger")
            return redirect(url_for("expenses.index"))
        expense.category_id = category_id
        expense.amount = amount
        expense.date = datetime.strptime(date_str, "%Y-%m-%d").date()
        expense.description = description
        expense.payment_method = payment_method
        db.session.commit()
        flash("Expense updated successfully.", "success")
    except ValueError:
        flash("Invalid expense information.", "danger")

    return redirect(url_for("expenses.index"))

@expenses_bp.route("/delete/<int:id>", methods=["POST"])
@login_required
def delete(id):
    expense = Expense.query.get_or_404(id)
    if expense.user_id != current_user.id:
        abort(403)

    db.session.delete(expense)
    db.session.commit()
    flash("Expense entry deleted.", "info")
    return redirect(url_for("expenses.index"))

# Categories management
@expenses_bp.route("/categories", methods=["GET"])
@login_required
def categories():
    today = date.today()
    cats = ExpenseCategory.query.filter_by(user_id=current_user.id).all()
    # Calculate spending for each category this month
    cat_data = []
    for c in cats:
        spent_res = (
            db.session.query(db.func.coalesce(db.func.sum(Expense.amount), 0.0))
            .filter(
                Expense.user_id == current_user.id,
                Expense.category_id == c.id,
                db.extract("month", Expense.date) == today.month,
                db.extract("year", Expense.date) == today.year
            )
            .scalar()
        )
        spent = float(spent_res or 0.0)
        remaining = max(0.0, c.monthly_limit - spent) if c.monthly_limit > 0 else 0.0
        used_pct = round((spent / c.monthly_limit * 100), 1) if c.monthly_limit > 0 else 0.0
        expense_count = Expense.query.filter_by(category_id=c.id).count()

        cat_data.append({
            "category": c,
            "spent": spent,
            "remaining": remaining,
            "used_pct": used_pct,
            "expense_count": expense_count
        })

    return render_template("categories.html", categories_data=cat_data)

@expenses_bp.route("/categories/add", methods=["POST"])
@login_required
def add_category():
    name = request.form.get("name", "").strip()
    monthly_limit_str = request.form.get("monthly_limit", "0").strip()

    if not name:
        flash("Category name is required.", "danger")
        return redirect(url_for("expenses.categories"))

    existing = ExpenseCategory.query.filter_by(user_id=current_user.id, name=name).first()
    if existing:
        flash("A category with this name already exists.", "warning")
        return redirect(url_for("expenses.categories"))

    try:
        limit = float(monthly_limit_str) if monthly_limit_str else 0.0
    except ValueError:
        limit = 0.0

    new_cat = ExpenseCategory(user_id=current_user.id, name=name, monthly_limit=limit)
    db.session.add(new_cat)
    db.session.commit()
    flash(f"Category '{name}' created successfully.", "success")
    return redirect(url_for("expenses.categories"))

@expenses_bp.route("/categories/edit/<int:id>", methods=["POST"])
@login_required
def edit_category(id):
    cat = ExpenseCategory.query.get_or_404(id)
    if cat.user_id != current_user.id:
        abort(403)

    name = request.form.get("name", "").strip()
    monthly_limit_str = request.form.get("monthly_limit", "0").strip()

    if not name:
        flash("Category name cannot be empty.", "danger")
        return redirect(url_for("expenses.categories"))

    try:
        limit = float(monthly_limit_str) if monthly_limit_str else 0.0
        cat.name = name
        cat.monthly_limit = limit
        db.session.commit()
        flash("Category updated successfully.", "success")
    except ValueError:
        flash("Invalid limit value.", "danger")

    return redirect(url_for("expenses.categories"))

@expenses_bp.route("/categories/delete/<int:id>", methods=["POST"])
@login_required
def delete_category(id):
    cat = ExpenseCategory.query.get_or_404(id)
    if cat.user_id != current_user.id:
        abort(403)

    # Check if category has associated expenses
    has_expenses = Expense.query.filter_by(category_id=cat.id).count() > 0
    if has_expenses:
        flash(f"Cannot delete category '{cat.name}' because it contains associated expenses. Reassign or delete those expenses first.", "danger")
        return redirect(url_for("expenses.categories"))

    db.session.delete(cat)
    db.session.commit()
    flash(f"Category '{cat.name}' deleted.", "info")
    return redirect(url_for("expenses.categories"))
