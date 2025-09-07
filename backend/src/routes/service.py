from flask import Blueprint
from src.controllers.service import add_service_types, update_service_type, delete_service_type, retrieve_service_types, add_service, update_service, delete_service, retrieve_services
from src.middlewares.authorize_token import authorize_token

# Create a Blueprint (like an Express Router)
service_bp = Blueprint("service", __name__)

# Service Types
service_bp.route("/type", methods=["POST"])(authorize_token(add_service_types))
service_bp.route("/type", methods=["PUT"])(authorize_token(update_service_type))
service_bp.route("/type", methods=["DELETE"])(authorize_token(delete_service_type))
service_bp.route("/type", methods=["GET"])(retrieve_service_types)

# Service
service_bp.route("", methods=["POST"])(authorize_token(add_service))
service_bp.route("", methods=["PUT"])(authorize_token(update_service))
service_bp.route("", methods=["DELETE"])(authorize_token(delete_service))
service_bp.route("", methods=["GET"])(retrieve_services)
