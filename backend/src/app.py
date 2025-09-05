from flask import Flask
from flask_cors import CORS
import logging

from src.config.application import ApplicationConfig
from src.middlewares.error_handler import register_error_handlers

# Routes
from src.routes.test import test_bp

app = Flask(__name__)

# Morgan → Flask logging
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")
app.logger.setLevel(logging.DEBUG)

# CORS → Flask-CORS
CORS(
    app,
    origins=[ApplicationConfig.CORS_OPTIONS["origin"]],
    supports_credentials=ApplicationConfig.CORS_OPTIONS["credentials"],
    methods=ApplicationConfig.CORS_OPTIONS["methods"],
    allow_headers=ApplicationConfig.CORS_OPTIONS["allowed_headers"]
)

# cookieParser → Flask built-in
# Cookies are already parsed via request.cookies
# Setting cookies is done via response.set_cookie()

# express.json() → Flask built-in
# Flask automatically parses JSON via request.get_json()

# Register blueprints (routers)
app.register_blueprint(test_bp, url_prefix="/api/test")

# Add this for some reason
@app.route("/favicon.ico")
def favicon():
    return "", 204   # 204 = No Content

# errorHandler → Flask errorhandler
register_error_handlers(app)