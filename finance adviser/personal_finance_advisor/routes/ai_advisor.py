from datetime import date
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from services import AIService, FinanceService
from models import Savings

ai_advisor_bp = Blueprint("ai_advisor", __name__, url_prefix="/ai-advisor")

SAMPLE_QUESTIONS = [
    "How can I reduce my food expenses?",
    "Where am I spending too much this month?",
    "How much should I save this month?",
    "How can I build an emergency fund on my current salary?",
    "Analyze my current spending habits and patterns.",
    "Give me practical suggestions for cutting unnecessary expenses."
]

def _build_user_financial_context(user_id: int):
    today = date.today()
    summary = FinanceService.get_monthly_summary(user_id, today.month, today.year)
    category_spending = FinanceService.get_category_spending(user_id, today.month, today.year)
    goals = [
        {"name": g.goal_name, "saved": g.amount, "target": g.goal_amount, "progress": f"{g.progress_percentage}%"}
        for g in Savings.query.filter_by(user_id=user_id).all()
    ]
    return {
        "monthly_income": current_user.monthly_income,
        "total_income": summary["total_income"],
        "total_expenses": summary["total_expenses"],
        "remaining_balance": summary["remaining_balance"],
        "savings_rate": summary["savings_rate"],
        "category_spending": [
            {"category_name": c["category_name"], "spent": c["spent"], "limit": c["monthly_limit"], "percent_of_total": c["percent_of_total"]}
            for c in category_spending if c["spent"] > 0
        ],
        "savings_goals": goals
    }

@ai_advisor_bp.route("/", methods=["GET"])
@login_required
def index():
    today = date.today()
    summary = FinanceService.get_monthly_summary(current_user.id, today.month, today.year)
    health = FinanceService.get_financial_health(current_user.id, today.month, today.year)
    is_configured = AIService.is_configured()
    provider = AIService.get_provider()

    return render_template(
        "ai_advisor.html",
        sample_questions=SAMPLE_QUESTIONS,
        summary=summary,
        health=health,
        is_configured=is_configured,
        provider=provider
    )

@ai_advisor_bp.route("/ask", methods=["POST"])
@login_required
def ask():
    data = request.get_json(silent=True) or request.form
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"success": False, "error": "Question cannot be empty."}), 400

    financial_context = _build_user_financial_context(current_user.id)
    answer = AIService.ask_finance_question(question, financial_context)

    return jsonify({
        "success": True,
        "question": question,
        "answer": answer
    })

@ai_advisor_bp.route("/analyze-spending", methods=["POST"])
@login_required
def analyze_spending():
    financial_context = _build_user_financial_context(current_user.id)
    analysis = AIService.analyze_spending(financial_context)

    return jsonify({
        "success": True,
        "analysis": analysis
    })
