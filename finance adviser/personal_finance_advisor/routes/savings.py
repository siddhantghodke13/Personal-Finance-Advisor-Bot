from datetime import datetime, date
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
from flask_login import login_required, current_user
from models import db, Savings

savings_bp = Blueprint("savings", __name__, url_prefix="/savings")

@savings_bp.route("/", methods=["GET"])
@login_required
def index():
    goals = Savings.query.filter_by(user_id=current_user.id).order_by(Savings.id.desc()).all()

    total_saved = sum(g.amount for g in goals)
    total_target = sum(g.goal_amount for g in goals)
    overall_progress = round((total_saved / total_target * 100), 1) if total_target > 0 else 0.0

    return render_template(
        "savings.html",
        goals=goals,
        total_saved=total_saved,
        total_target=total_target,
        overall_progress=overall_progress,
        today=date.today().strftime("%Y-%m-%d")
    )

@savings_bp.route("/add", methods=["POST"])
@login_required
def add():
    goal_name = request.form.get("goal_name", "").strip()
    goal_amount_str = request.form.get("goal_amount", "").strip()
    current_amount_str = request.form.get("current_amount", "0").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()

    if not goal_name or not goal_amount_str:
        flash("Goal name and target amount are required.", "danger")
        return redirect(url_for("savings.index"))

    try:
        goal_amount = float(goal_amount_str)
        current_amount = float(current_amount_str) if current_amount_str else 0.0
        if goal_amount <= 0:
            flash("Target amount must be greater than zero.", "danger")
            return redirect(url_for("savings.index"))
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else date.today()
    except ValueError:
        flash("Invalid target amount or date.", "danger")
        return redirect(url_for("savings.index"))

    goal = Savings(
        user_id=current_user.id,
        goal_name=goal_name,
        goal_amount=goal_amount,
        amount=current_amount,
        date=target_date,
        description=description
    )
    db.session.add(goal)
    db.session.commit()
    flash(f"Savings goal '{goal_name}' created.", "success")
    return redirect(url_for("savings.index"))

@savings_bp.route("/contribute/<int:id>", methods=["POST"])
@login_required
def contribute(id):
    goal = Savings.query.get_or_404(id)
    if goal.user_id != current_user.id:
        abort(403)

    deposit_str = request.form.get("deposit_amount", "").strip()
    try:
        deposit = float(deposit_str)
        if deposit <= 0:
            flash("Contribution must be greater than zero.", "danger")
            return redirect(url_for("savings.index"))
        goal.amount += deposit
        db.session.commit()
        flash(f"Added ₹{deposit:,.2f} to '{goal.goal_name}'! New total: ₹{goal.amount:,.2f}.", "success")
    except ValueError:
        flash("Invalid contribution amount.", "danger")

    return redirect(url_for("savings.index"))

@savings_bp.route("/edit/<int:id>", methods=["POST"])
@login_required
def edit(id):
    goal = Savings.query.get_or_404(id)
    if goal.user_id != current_user.id:
        abort(403)

    goal_name = request.form.get("goal_name", "").strip()
    goal_amount_str = request.form.get("goal_amount", "").strip()
    amount_str = request.form.get("amount", "").strip()
    date_str = request.form.get("date", "").strip()
    description = request.form.get("description", "").strip()

    try:
        goal_amount = float(goal_amount_str)
        amount = float(amount_str)
        goal.goal_name = goal_name
        goal.goal_amount = goal_amount
        goal.amount = amount
        if date_str:
            goal.date = datetime.strptime(date_str, "%Y-%m-%d").date()
        goal.description = description
        db.session.commit()
        flash("Savings goal updated successfully.", "success")
    except ValueError:
        flash("Invalid numeric value.", "danger")

    return redirect(url_for("savings.index"))

@savings_bp.route("/delete/<int:id>", methods=["POST"])
@login_required
def delete(id):
    goal = Savings.query.get_or_404(id)
    if goal.user_id != current_user.id:
        abort(403)

    db.session.delete(goal)
    db.session.commit()
    flash(f"Savings goal '{goal.goal_name}' removed.", "info")
    return redirect(url_for("savings.index"))
