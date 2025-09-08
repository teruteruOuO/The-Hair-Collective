from flask import Blueprint
from src.controllers.stylist import add_stylist, retrieve_all_stylist, delete_stylist, update_stylist, retrieve_stylist
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
stylist_bp = Blueprint("stylist", __name__)

# Register routes
stylist_bp.route("", methods=["POST"])(authorize_token(add_stylist))
stylist_bp.route("", methods=["PUT"])(authorize_token(update_stylist))
stylist_bp.route("", methods=["DELETE"])(authorize_token(delete_stylist))
stylist_bp.route("", methods=["GET"])(retrieve_all_stylist)
stylist_bp.route("/", methods=["GET"])(authorize_token(retrieve_stylist))