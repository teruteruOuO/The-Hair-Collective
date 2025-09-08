from flask import Flask
from flask_cors import CORS
import logging

from src.config.application import ApplicationConfig
from src.middlewares.error_handler import register_error_handlers

# Routes
from src.routes.test import test_bp
from src.routes.authentication import authentication_bp
from src.routes.generate_url import generate_url_bp
from src.routes.slideshow import slideshow_bp
from src.routes.service import service_bp
from src.routes.stylist import stylist_bp

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
app.register_blueprint(authentication_bp, url_prefix="/api/authentication")
app.register_blueprint(generate_url_bp, url_prefix="/api/generate_url")
app.register_blueprint(slideshow_bp, url_prefix="/api/slideshow")
app.register_blueprint(service_bp, url_prefix="/api/service")
app.register_blueprint(stylist_bp, url_prefix="/api/stylist")

# Add this for some reason
@app.route("/favicon.ico")
def favicon():
    return "", 204   # 204 = No Content

# errorHandler → Flask errorhandler
register_error_handlers(app)