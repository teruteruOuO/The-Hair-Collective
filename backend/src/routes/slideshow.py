from flask import Blueprint
from src.controllers.slideshow import add_slideshow_image, retrieve_slideshow_images
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
slideshow_bp = Blueprint("slideshow", __name__)

# Register routes
slideshow_bp.route("", methods=["POST"])(authorize_token(add_slideshow_image))
slideshow_bp.route("", methods=["GET"])(retrieve_slideshow_images)