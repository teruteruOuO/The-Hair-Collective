from flask import Blueprint
from src.controllers.review import add_review, update_review, delete_review, retrieve_reviews, retrieve_review
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
review_bp = Blueprint("review", __name__)

# Register routes
review_bp.route("", methods=["POST"])(add_review)
review_bp.route("", methods=["PUT"])(update_review)
review_bp.route("", methods=["DELETE"])(delete_review)
review_bp.route("", methods=["GET"])(retrieve_review)

review_bp.route("/showcase", methods=["GET"])(retrieve_reviews)