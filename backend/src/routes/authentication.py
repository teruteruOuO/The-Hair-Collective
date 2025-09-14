from flask import Blueprint
from src.controllers.authentication import login_user, logout_user, verify_token

# Create a Blueprint (like an Express Router)
authentication_bp = Blueprint("authentication", __name__)

# Register routes
authentication_bp.route("login", methods=["POST"])(login_user)
authentication_bp.route("logout", methods=["POST"])(logout_user)
authentication_bp.route("verify-token", methods=["POST"])(verify_token)