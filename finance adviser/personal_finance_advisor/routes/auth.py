import re
from datetime import datetime, date, timedelta
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, ExpenseCategory, Income, Expense, Budget, Savings

auth_bp = Blueprint("auth", __name__)

DEFAULT_CATEGORIES = [
    ("Food", 8000.0),
    ("Transport", 4000.0),
    ("Rent", 15000.0),
    ("Education", 3000.0),
    ("Entertainment", 3500.0),
    ("Shopping", 4000.0),
    ("Healthcare", 2500.0),
    ("Utilities", 3000.0),
    ("Bills", 2000.0),
    ("Other", 2000.0)
]

def seed_default_categories(user_id: int):
    """Create initial default categories for a new user."""
    for name, limit in DEFAULT_CATEGORIES:
        existing = ExpenseCategory.query.filter_by(user_id=user_id, name=name).first()
        if not existing:
            cat = ExpenseCategory(user_id=user_id, name=name, monthly_limit=limit)
            db.session.add(cat)
    db.session.commit()

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")
        monthly_income = request.form.get("monthly_income", "0").strip()

        # Validation
        if not name or not email or not password:
            flash("All required fields must be filled out.", "danger")
            return render_template("register.html", name=name, email=email)

        # Email regex check
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, email):
            flash("Please enter a valid email address.", "danger")
            return render_template("register.html", name=name, email=email)

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html", name=name, email=email)

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html", name=name, email=email)

        if User.query.filter_by(email=email).first():
            flash("An account with this email already exists. Please log in.", "warning")
            return redirect(url_for("auth.login"))

        try:
            income_val = float(monthly_income) if monthly_income else 0.0
        except ValueError:
            income_val = 0.0

        user = User(name=name, email=email, monthly_income=income_val)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Seed initial categories
        seed_default_categories(user.id)

        flash("Registration successful! You may now log in.", "success")
        return redirect(url_for("auth.login"))

    return render_template("register.html")

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        remember = bool(request.form.get("remember"))

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash("Invalid email or password. Please try again.", "danger")
            return render_template("login.html", email=email)

        login_user(user, remember=remember)
        flash(f"Welcome back, {user.name}!", "success")

        next_page = request.args.get("next")
        # Prevent open redirect vulnerability
        if not next_page or not next_page.startswith("/"):
            next_page = url_for("dashboard.index")
        return redirect(next_page)

    return render_template("login.html")

@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been successfully logged out.", "info")
    return redirect(url_for("auth.login"))

@auth_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        monthly_income = request.form.get("monthly_income", "").strip()
        financial_goal = request.form.get("financial_goal", "").strip()

        if not name:
            flash("Name cannot be empty.", "danger")
            return redirect(url_for("auth.profile"))

        current_user.name = name
        current_user.financial_goal = financial_goal
        try:
            current_user.monthly_income = float(monthly_income) if monthly_income else 0.0
        except ValueError:
            pass

        # Optional password update
        new_password = request.form.get("new_password", "").strip()
        if new_password:
            if len(new_password) < 6:
                flash("New password must be at least 6 characters.", "danger")
                return redirect(url_for("auth.profile"))
            current_user.set_password(new_password)

        db.session.commit()
        flash("Profile updated successfully.", "success")
        return redirect(url_for("auth.profile"))

    return render_template("profile.html")

@auth_bp.route("/demo-login")
def demo_login():
    """
    1-Click Demo account setup for immediate evaluation and university demo.
    Seeds realistic Indian Rupee transactions, budgets, and savings.
    """
    demo_email = "demo@financeadvisor.local"
    demo_user = User.query.filter_by(email=demo_email).first()

    today = date.today()
    curr_month = today.month
    curr_year = today.year

    if not demo_user:
        demo_user = User(
            name="Rahul Sharma",
            email=demo_email,
            monthly_income=75000.0,
            financial_goal="Save ₹2,00,000 for emergency fund and down payment"
        )
        demo_user.set_password("demo1234")
        db.session.add(demo_user)
        db.session.commit()

        seed_default_categories(demo_user.id)

    # Ensure categories exist
    cats = {c.name: c.id for c in ExpenseCategory.query.filter_by(user_id=demo_user.id).all()}

    # Check if sample data already exists; if not, populate
    if demo_user.incomes.count() == 0:
        # Incomes
        i1 = Income(user_id=demo_user.id, source="Primary Salary (Tech Corp)", amount=70000.0, date=today.replace(day=1), description="Monthly salary credit")
        i2 = Income(user_id=demo_user.id, source="Freelance Consulting", amount=12000.0, date=today.replace(day=10), description="Web application optimization project")
        db.session.add_all([i1, i2])

        # Previous month income for comparison
        prev_date = (today.replace(day=1) - timedelta(days=5)).replace(day=1)
        pi1 = Income(user_id=demo_user.id, source="Primary Salary", amount=70000.0, date=prev_date, description="Previous month salary")
        db.session.add(pi1)

        # Expenses for current month
        expenses_data = [
            (cats.get("Rent", 1), 22000.0, today.replace(day=2), "2BHK Apartment Rent", "Bank Transfer"),
            (cats.get("Food", 1), 5400.0, today.replace(day=5), "Monthly grocery bulk purchase (DMart)", "UPI"),
            (cats.get("Food", 1), 1850.0, today.replace(day=8), "Weekend family dinner", "Credit Card"),
            (cats.get("Food", 1), 950.0, today.replace(day=14), "Online grocery top-up (Blinkit)", "UPI"),
            (cats.get("Utilities", 1), 2600.0, today.replace(day=6), "Electricity and high-speed fiber internet", "UPI"),
            (cats.get("Transport", 1), 3200.0, today.replace(day=7), "Fuel refill and Metro smart card top-up", "Debit Card"),
            (cats.get("Entertainment", 1), 1499.0, today.replace(day=11), "OTT subscriptions & movie tickets", "Credit Card"),
            (cats.get("Shopping", 1), 3800.0, today.replace(day=12), "Formal office wear and footwear", "Credit Card"),
            (cats.get("Healthcare", 1), 1200.0, today.replace(day=9), "Prescription refills and supplements", "UPI"),
            (cats.get("Bills", 1), 1800.0, today.replace(day=4), "Mobile postpaid plans and DTH", "UPI"),
        ]

        for cat_id, amt, dt, desc, method in expenses_data:
            if cat_id:
                exp = Expense(user_id=demo_user.id, category_id=cat_id, amount=amt, date=dt, description=desc, payment_method=method)
                db.session.add(exp)

        # Budgets
        budgets_data = [
            (cats.get("Rent", 1), 22000.0),
            (cats.get("Food", 1), 9000.0),
            (cats.get("Transport", 1), 4000.0),
            (cats.get("Utilities", 1), 3500.0),
            (cats.get("Entertainment", 1), 3000.0),
            (cats.get("Shopping", 1), 4500.0),
            (cats.get("Healthcare", 1), 2500.0),
            (cats.get("Bills", 1), 2500.0),
        ]
        for cat_id, planned in budgets_data:
            if cat_id:
                b = Budget(user_id=demo_user.id, category_id=cat_id, month=curr_month, year=curr_year, planned_amount=planned)
                db.session.add(b)

        # Savings Goals
        s1 = Savings(user_id=demo_user.id, goal_name="Emergency Reserve Fund", goal_amount=150000.0, amount=85000.0, date=today.replace(day=3), description="Liquid mutual fund & high-yield FD")
        s2 = Savings(user_id=demo_user.id, goal_name="MacBook Pro Upgrade", goal_amount=120000.0, amount=65000.0, date=today.replace(day=10), description="Tech career upgrade goal")
        s3 = Savings(user_id=demo_user.id, goal_name="Goa Family Vacation", goal_amount=40000.0, amount=28000.0, date=today.replace(day=12), description="Year-end travel fund")
        db.session.add_all([s1, s2, s3])

        db.session.commit()

    login_user(demo_user)
    flash("Logged in with Demo Account! Full sample data has been loaded for testing.", "success")
    return redirect(url_for("dashboard.index"))
