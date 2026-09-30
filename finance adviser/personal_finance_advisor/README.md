# Personal Finance Advisor Bot

An AI-powered personal finance management web application engineered with Python, Flask, SQLAlchemy, Chart.js, and Google Gemini / OpenAI. It helps users manage monthly income, expenses, category budgets, savings goals, and spending habits with actionable AI-driven financial recommendations in Indian Rupees (₹).

---

## 1. Project Overview

The **Personal Finance Advisor Bot** is designed for students, young professionals, and families seeking total clarity over their personal cash flow. Built to production-grade web standards, it enforces strict user-data isolation, dynamic 50/30/20 budget allocations, and automated AI assistance for reducing discretionary expenditures.

---

## 2. Key Features

- **Authentication & Security:** Secure registration, login, session management via Flask-Login, and Werkzeug salted password hashing. Unauthenticated users cannot access financial records.
- **Strict Data Isolation:** Every database query filters strictly by `current_user.id` to prevent unauthorized cross-user access via URL tampering.
- **Indian Rupee (INR ₹) Native:** Standard formatting with commas, currency symbols, and realistic Indian expense categories (Rent, Blinkit/Groceries, UPI payments, Utilities).
- **Core Financial Tracking (CRUD):**
  - **Incomes:** Source categorization (Salary, Freelance, Scholarship, Business), date filtering, and monthly inflow totals.
  - **Expenses:** Category association, payment methods (UPI, Debit Card, Credit Card, Cash, Bank Transfer), search, and filtering.
  - **Expense Categories:** Custom categories with monthly limits and spending progress indicators.
  - **Monthly Budgets:** Planned vs. Actual spending analysis with overspending badges and warning thresholds.
  - **Savings Goals:** Milestones for Emergency Reserves, Tech gadgets, and Travel with contribution tracking.
- **AI Financial Advisor (Gemini 2.5 / OpenAI):**
  - **Smart Budget Generator:** Analyzes income and recent expenditures to formulate a balanced 50/30/20 budget with user review before applying.
  - **Conversational Advisor:** Answers questions like *"How can I reduce food expenses?"* grounded in user records without exposing sensitive credentials.
  - **Deep Spending Analyzer:** Detects category overspending and flags increasing expense trends.
- **Visual Analytics:** Interactive Chart.js graphs (Income vs. Expense, Category Breakdown, Savings Allocation, Budget vs. Actual).
- **Printable Reports:** Executive monthly financial summaries formatted for browser printing and PDF generation.
- **1-Click Demo Account:** Instant demo login pre-populated with realistic income, expenses, budgets, and savings goals for immediate evaluation.

---

## 3. Technology Stack

- **Backend:** Python 3.10+, Flask 3.x, Flask-SQLAlchemy, Flask-Login, python-dotenv, Werkzeug.
- **Database:** SQLite (default for development/demo), fully compatible with PostgreSQL.
- **AI Integration:** Google Gemini API (`google-genai` / `google-generativeai`) and OpenAI (`openai`).
- **Frontend:** Jinja2 Templates, Bootstrap 5.3, Bootstrap Icons, Chart.js 4.4, Custom CSS.
- **Deployment:** Gunicorn, Ngrok for public tunneling.

---

## 4. Project Structure

```
personal_finance_advisor/
├── app.py                     # Flask application factory and entry point
├── config.py                  # Environment and database configuration
├── requirements.txt           # Python package dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # Complete documentation and setup guide
│
├── instance/
│   └── finance.db             # SQLite database file (created automatically)
│
├── models/                    # SQLAlchemy database models
│   ├── __init__.py
│   ├── user.py                # User accounts & authentication
│   ├── income.py              # Income transactions
│   ├── expense.py             # Expense transactions
│   ├── category.py            # User-defined expense categories
│   ├── budget.py              # Monthly planned category budgets
│   ├── savings.py             # Savings goals & contribution history
│   └── report.py              # Monthly snapshot reports
│
├── routes/                    # Flask Blueprints
│   ├── __init__.py
│   ├── auth.py                # Register, login, logout, demo-login, profile
│   ├── dashboard.py           # Metrics, Chart.js payloads, recent activity
│   ├── income.py              # Income CRUD & filtering
│   ├── expenses.py            # Expense & Category CRUD
│   ├── budget.py              # Budget management & AI generation
│   ├── savings.py             # Savings goals & contributions
│   ├── reports.py             # Monthly printable reports & JSON export
│   └── ai_advisor.py          # AI Q&A and spending analysis
│
├── services/                  # Business logic & external APIs
│   ├── __init__.py
│   ├── ai_service.py          # Gemini & OpenAI provider abstraction & JSON parsing
│   ├── finance_service.py     # Aggregations, ratios, health calculation
│   ├── budget_service.py      # Planned vs actual variance
│   └── report_service.py      # Monthly report synthesis
│
├── templates/                 # Jinja2 HTML templates
│   ├── base.html              # Master layout with responsive navbar & Chart.js
│   ├── index.html             # Landing page
│   ├── login.html             # User login
│   ├── register.html          # User registration
│   ├── dashboard.html         # Main dashboard with 4 charts & quick actions
│   ├── profile.html           # User profile and goals
│   ├── income.html            # Income management
│   ├── expenses.html          # Expense tracking
│   ├── categories.html        # Category limits & management
│   ├── budget.html            # Budget planning & AI budget modal
│   ├── savings.html           # Savings goals & progress
│   ├── reports.html           # Printable monthly reports
│   ├── ai_advisor.html        # Interactive AI chatbot & insights
│   └── errors/
│       ├── 404.html           # Friendly 404 page
│       └── 500.html           # Friendly 500 page
│
└── static/
    ├── css/
    │   └── style.css          # Custom styling, fonts & print styles
    └── js/
        ├── dashboard.js       # Chart.js initialization
        └── finance.js         # Interactive UI utilities
```

---

## 5. Step-by-Step Installation & Setup

### Prerequisites
- Python 3.10 or higher installed. (Check with `python --version` or `py --version`).
- `pip` package manager installed.

### Step 1: Open Terminal / Command Prompt
Navigate to the project root directory:
```bash
cd personal_finance_advisor
```

### Step 2: Create a Virtual Environment

**On Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to create your active `.env` file:

**On Windows:**
```cmd
copy .env.example .env
```

**On macOS / Linux:**
```bash
cp .env.example .env
```

Open `.env` in any text editor (Notepad, VS Code) and set your configurations:
```ini
SECRET_KEY=generate_a_random_secret_key_here
DATABASE_URL=sqlite:///finance.db
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=
PORT=5000
```

> **Note on Security:** Never commit your actual `.env` file with secret keys to version control. The `.gitignore` file already excludes `.env`.

---

## 6. How to Configure AI Providers

### Option A: Google Gemini API (Recommended & Free Tier Available)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google Account and click **"Get API key"**.
3. Create an API key in a new or existing Google Cloud project.
4. Copy the API key and paste it into `.env`:
   ```ini
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

### Option B: OpenAI ChatGPT API
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys).
2. Generate a new secret API key.
3. Update `.env`:
   ```ini
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...your_key_here
   ```

> **Graceful Fallback:** If you do not provide an API key, the application will **not** crash. All expense, budget, and reporting features will work normally, and the AI features will operate with transparent educational notices.

---

## 7. Running the Application Locally

Once your virtual environment is active and dependencies are installed, start the Flask server:

```bash
python app.py
```

You will see:
```text
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
 * Restarting with stat
 * Debugger is active!
```

Open your browser and navigate to:
**[http://localhost:5000](http://localhost:5000)**

---

## 8. Demo Account Setup (1-Click Test)

To test the application immediately with realistic Indian Rupee figures and chart distributions:
1. Open [http://localhost:5000](http://localhost:5000).
2. Click the yellow **"1-Click Demo Login"** button on the landing page or login screen.
3. The application will automatically create (or log into) the demo account:
   - **Email:** `demo@financeadvisor.local`
   - **Password:** `demo1234`
4. The dashboard will populate with sample tech salary credits, DMart grocery bills, 2BHK apartment rent, UPI transactions, planned category budgets, and savings goals.

---

## 9. Ngrok Deployment (For Remote Demonstrations)

Ngrok exposes your local Flask development server through a secure public URL so professors, evaluators, or team members can access it on their phones or laptops.

1. Download and install [Ngrok](https://ngrok.com/download).
2. Ensure Flask is running on port 5000:
   ```bash
   python app.py
   ```
3. Open a **second** terminal window and run:
   ```bash
   ngrok http 5000
   ```
4. Ngrok will display a public forwarding URL such as:
   ```text
   Forwarding   https://a1b2-c3d4.ngrok-free.app -> http://localhost:5000
   ```
5. Share this `https://*.ngrok-free.app` URL with your audience. They can interact with the live application without needing Python installed!

---

## 10. Database Schema Explanation

The application uses SQLAlchemy with relational tables:

1. **`users`**:
   - `id` (PK), `name`, `email` (Unique Index), `password_hash`, `monthly_income`, `financial_goal`, `created_at`.
   - Has one-to-many cascading relationships with all transaction tables.
2. **`expense_categories`**:
   - `id` (PK), `user_id` (FK), `name`, `monthly_limit`, `created_at`.
   - Protects against accidental deletion if child expenses exist.
3. **`incomes`**:
   - `id` (PK), `user_id` (FK), `source`, `amount`, `date`, `description`, `created_at`.
4. **`expenses`**:
   - `id` (PK), `user_id` (FK), `category_id` (FK), `amount`, `date`, `description`, `payment_method`, `created_at`.
5. **`budgets`**:
   - `id` (PK), `user_id` (FK), `category_id` (FK), `month`, `year`, `planned_amount`, `created_at`.
   - Enforces unique constraint per `(user_id, category_id, month, year)`.
6. **`savings`**:
   - `id` (PK), `user_id` (FK), `goal_name`, `goal_amount`, `amount` (current saved), `date`, `description`, `created_at`.
7. **`monthly_reports`**:
   - `id` (PK), `user_id` (FK), `month`, `year`, `total_income`, `total_expenses`, `total_savings`, `savings_rate`, `generated_at`.

---

## 11. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `ModuleNotFoundError: No module named 'flask'` | Virtual environment not activated or packages not installed | Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac) and run `pip install -r requirements.txt`. |
| `sqlite3.OperationalError: unable to open database file` | `instance` directory permissions | Ensure the folder `instance/` exists and has write permissions. `app.py` creates it automatically. |
| AI Advisor returns "API key not configured" | `GEMINI_API_KEY` missing from `.env` | Add your API key to `.env` and restart the Flask server. |
| Port 5000 is already in use | Another application or previous Flask process is bound to port 5000 | Set `PORT=5001` in `.env` or run `python app.py` with port flag. On Mac, turn off "AirPlay Receiver" which uses port 5000. |
| Chart.js not rendering | Internet connectivity for CDN | Check browser console. Ensure CDN scripts in `base.html` are reachable or load over active network connection. |
