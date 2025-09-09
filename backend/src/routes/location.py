from flask import Blueprint
from src.controllers.location import add_location, update_location, delete_location, add_opening_hour, update_opening_hour, delete_opening_hour, retrieve_all_locations, retrieve_location
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
location_bp = Blueprint("location", __name__)

# Register routes
location_bp.route("", methods=["POST"])(authorize_token(add_location))
location_bp.route("", methods=["PUT"])(authorize_token(update_location))
location_bp.route("", methods=["DELETE"])(authorize_token(delete_location))

# Opening hours
location_bp.route("/opening-hour", methods=["POST"])(authorize_token(add_opening_hour))
location_bp.route("/opening-hour", methods=["PUT"])(authorize_token(update_opening_hour))
location_bp.route("/opening-hour", methods=["DELETE"])(authorize_token(delete_opening_hour))

# Retrieve locations
location_bp.route("", methods=["GET"])(retrieve_all_locations)
location_bp.route("/", methods=["GET"])(authorize_token(retrieve_location))