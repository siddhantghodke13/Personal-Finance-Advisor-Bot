import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a personal finance education assistant. Analyze the user's provided financial information and provide clear, practical, general financial guidance. Do not claim to be a certified financial advisor. Do not guarantee investment returns. Clearly mention when professional financial advice may be appropriate.
All currency values are in Indian Rupees (INR, symbol ₹). Provide realistic, actionable advice tailored to Indian urban and semi-urban spending patterns."""

class AIService:
    """
    AI Integration Service supporting Google Gemini and OpenAI.
    Provides automated budget generation, spending analysis, recommendations,
    and conversational Q&A. Gracefully handles errors and missing keys without crashing.
    """

    @classmethod
    def get_provider(cls) -> str:
        return os.getenv("AI_PROVIDER", "gemini").lower()

    @classmethod
    def is_configured(cls) -> bool:
        provider = cls.get_provider()
        if provider == "openai":
            return bool(os.getenv("OPENAI_API_KEY"))
        # default to gemini
        return bool(os.getenv("GEMINI_API_KEY"))

    @classmethod
    def _call_ai(cls, prompt: str, system_prompt: str = SYSTEM_PROMPT, response_json: bool = False) -> str:
        """Internal helper to dispatch to selected AI provider."""
        provider = cls.get_provider()

        if provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.")
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            kwargs = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4,
            }
            if response_json:
                kwargs["response_format"] = {"type": "json_object"}

            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""

        # Default Gemini provider
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.")

        # Try Google GenAI SDK
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            config = {}
            if response_json:
                config["response_mime_type"] = "application/json"

            full_prompt = f"{system_prompt}\n\nUser Question / Task:\n{prompt}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
                config=config if config else None
            )
            return response.text or ""
        except ImportError:
            # Fallback to legacy google.generativeai if installed
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt
            )
            resp = model.generate_content(prompt)
            return resp.text or ""

    @classmethod
    def generate_budget(cls, financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI-powered smart monthly budget recommendation.
        Returns structured JSON with category allocations, reasons, savings target, emergency fund, and summary.
        """
        monthly_income = financial_data.get("monthly_income", 50000.0)
        recent_expenses = financial_data.get("recent_expenses", [])
        categories = financial_data.get("categories", [])
        financial_goal = financial_data.get("financial_goal", "Build emergency fund and save 20%")

        # Default fallback budget if AI is unavailable
        fallback_budget = cls._create_fallback_budget(monthly_income, categories)

        if not cls.is_configured():
            fallback_budget["summary"] += " (AI API key not configured in .env; generated using the standard 50-30-20 rule)."
            return fallback_budget

        prompt = f"""
Analyze the following financial profile and generate a practical, balanced monthly budget following the 50/30/20 rule (Needs, Wants, Savings/Debt).
All amounts are in Indian Rupees (INR, ₹).

Financial Profile:
- Monthly Income: ₹{monthly_income:,.2f}
- Financial Goal: {financial_goal}
- Available Categories: {', '.join(categories) if categories else 'Food, Transport, Rent, Utilities, Entertainment, Shopping, Healthcare, Bills, Other'}
- Recent Expense History Summary: {json.dumps(recent_expenses[:10])}

CRITICAL: You MUST respond strictly with valid JSON conforming to this schema:
{{
  "budget": [
    {{
      "category": "Food",
      "amount": 6000,
      "reason": "Based on reasonable grocery and dining allowance"
    }}
  ],
  "savings_target": 10000,
  "emergency_fund": 4000,
  "summary": "Practical monthly budget following the 50/30/20 rule allowing ₹10,000 for savings."
}}

Ensure all category names match common spending categories and the total budgeted amounts + savings equals or is slightly below the monthly income.
"""

        try:
            raw_text = cls._call_ai(prompt, response_json=True)
            # Clean markdown code blocks if present
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)

            # Validate structure
            if "budget" in parsed and isinstance(parsed["budget"], list):
                # Ensure amounts are numeric
                for item in parsed["budget"]:
                    item["amount"] = float(item.get("amount", 0.0))
                parsed["savings_target"] = float(parsed.get("savings_target", monthly_income * 0.2))
                parsed["emergency_fund"] = float(parsed.get("emergency_fund", monthly_income * 0.05))
                parsed["summary"] = parsed.get("summary", "Personalized budget recommendation generated by AI.")
                return parsed
            else:
                logger.warning("AI output JSON did not contain 'budget' list, using fallback.")
                return fallback_budget
        except Exception as e:
            logger.error(f"AI Budget generation error: {e}")
            fallback_budget["summary"] += f" (Note: AI service encountered an error ({str(e)}), generated algorithmic budget)."
            return fallback_budget

    @classmethod
    def _create_fallback_budget(cls, monthly_income: float, categories: List[str]) -> Dict[str, Any]:
        """Algorithmic 50/30/20 rule budget when AI is unavailable."""
        needs_pool = monthly_income * 0.50
        wants_pool = monthly_income * 0.30
        savings_pool = monthly_income * 0.20

        default_cats = [
            ("Rent", needs_pool * 0.40, "Housing allocation (Rent/Mortgage)"),
            ("Food", needs_pool * 0.30, "Nutritious groceries and basic dining"),
            ("Utilities", needs_pool * 0.15, "Electricity, water, gas, internet"),
            ("Transport", needs_pool * 0.15, "Commute, fuel, public transit"),
            ("Entertainment", wants_pool * 0.40, "Streaming, movies, weekend outings"),
            ("Shopping", wants_pool * 0.35, "Clothing and personal items"),
            ("Healthcare", wants_pool * 0.25, "Medicines and wellness checkups"),
        ]

        budget_items = []
        for cat_name, amt, reason in default_cats:
            budget_items.append({
                "category": cat_name,
                "amount": round(amt, 0),
                "reason": reason
            })

        return {
            "budget": budget_items,
            "savings_target": round(savings_pool * 0.75, 0),
            "emergency_fund": round(savings_pool * 0.25, 0),
            "summary": "Algorithmic budget based on the classic 50-30-20 principle (50% Essentials, 30% Discretionary, 20% Savings)."
        }

    @classmethod
    def ask_finance_question(cls, question: str, financial_data: Dict[str, Any]) -> str:
        """
        Answers a user's personal finance query grounded in their actual financial metrics.
        Never shares passwords or sensitive personal identification.
        """
        if not cls.is_configured():
            return (
                "⚠️ AI features are currently unavailable because an API key has not been configured.\n\n"
                "To enable AI advice:\n"
                "1. Open your `.env` file in the project root\n"
                "2. Set `GEMINI_API_KEY=your_key_here` (get a free key from Google AI Studio)\n"
                "3. Restart the Flask application.\n\n"
                "In the meantime, you can review your Dashboard and Reports for data-driven spending insights!"
            )

        context_str = f"""
User's Financial Snapshot:
- Monthly Income: ₹{financial_data.get('total_income', 0):,.2f}
- Monthly Expenses: ₹{financial_data.get('total_expenses', 0):,.2f}
- Remaining Balance: ₹{financial_data.get('remaining_balance', 0):,.2f}
- Current Savings Rate: {financial_data.get('savings_rate', 0)}%
- Top Spending Categories: {json.dumps(financial_data.get('category_spending', [])[:5])}
- Active Savings Goals: {json.dumps(financial_data.get('savings_goals', []))}
"""
        prompt = f"""
{context_str}

User Question: "{question}"

Please provide actionable, clear, educational financial advice grounded in the numbers above. Format with clear bullet points or short paragraphs. Avoid financial jargon. Remind the user this is for educational purposes.
"""
        try:
            return cls._call_ai(prompt)
        except Exception as e:
            logger.error(f"AI Q&A Error: {e}")
            return f"I'm sorry, I could not process your request at this moment due to a service error ({str(e)}). Please try again shortly."

    @classmethod
    def analyze_spending(cls, financial_data: Dict[str, Any]) -> str:
        """Generates AI spending analysis highlighting trends, overspending, and improvement areas."""
        if not cls.is_configured():
            return "Spending analysis requires an AI API key. Configure GEMINI_API_KEY in your .env file to enable automated insights."

        prompt = f"""
Perform a comprehensive spending analysis for this user based on their monthly metrics:
Data: {json.dumps(financial_data)}

Highlight:
1. Category overspending or high allocation
2. Savings rate evaluation
3. Three specific, realistic cost-reduction opportunities
Keep it concise and encouraging.
"""
        try:
            return cls._call_ai(prompt)
        except Exception as e:
            return f"Spending analysis could not be generated: {str(e)}"

    @classmethod
    def generate_recommendations(cls, financial_data: Dict[str, Any]) -> List[str]:
        """Generate 3 to 5 targeted recommendations based on user financial records."""
        # Baseline rule-based recommendations
        income = financial_data.get("total_income", 0)
        expenses = financial_data.get("total_expenses", 0)
        savings_rate = financial_data.get("savings_rate", 0)

        recs = []
        if savings_rate < 20 and income > 0:
            deficit = round((income * 0.20) - (income * (savings_rate / 100)), 0)
            recs.append(f"Increasing your monthly savings by ₹{deficit:,.0f} would help you reach the benchmark 20% savings target.")

        cats = financial_data.get("category_spending", [])
        if cats:
            top_cat = cats[0]
            if top_cat.get("spent", 0) > 0:
                recs.append(f"Your highest expenditure is on '{top_cat.get('category_name')}'. Trimming 10% can save you ₹{round(top_cat.get('spent') * 0.10, 0):,.0f} each month.")

        recs.append("Automate your savings deposit on payday before beginning discretionary spending ('Pay Yourself First').")
        recs.append("Build an emergency reserve holding 3 to 6 months of living expenses in an accessible savings vehicle.")

        return recs
