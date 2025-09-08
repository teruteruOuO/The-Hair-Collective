from flask import Blueprint
from src.controllers.generate_url import generate_signed_upload_url, generate_signed_delete_url
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
generate_url_bp = Blueprint("generate_url", __name__)

# Register routes
generate_url_bp.route("", methods=["POST"])(authorize_token(generate_signed_upload_url))
generate_url_bp.route("", methods=["DELETE"])(authorize_token(generate_signed_delete_url))
