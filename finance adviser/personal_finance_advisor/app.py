import os
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, current_user
from config import Config
from models import db, User

login_manager = LoginManager()

def create_app(config_class=Config):
    """Application factory for Personal Finance Advisor Bot."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize database
    db.init_app(app)

    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "warning"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register Jinja custom filters
    @app.template_filter("inr")
    def format_inr(value):
        """Format float/int to Indian Rupee currency format (₹1,50,000.00)."""
        if value is None:
            return "₹0.00"
        try:
            val = float(value)
            # Format with 2 decimal places
            return f"₹{val:,.2f}"
        except (ValueError, TypeError):
            return str(value)

    # Register Blueprints
    from routes import (
        auth_bp,
        dashboard_bp,
        income_bp,
        expenses_bp,
        budget_bp,
        savings_bp,
        reports_bp,
        ai_advisor_bp
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(income_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(savings_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(ai_advisor_bp)

    # Landing page route
    @app.route("/")
    def index():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard.index"))
        return render_template("index.html")

    # Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("errors/500.html"), 500

    # Auto create tables on startup
    with app.app_context():
        # Ensure instance folder exists
        os.makedirs(app.instance_path, exist_ok=True)
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
