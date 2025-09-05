from flask import Blueprint
from src.controllers.test import get_test_table

# Create a Blueprint (like an Express Router)
test_bp = Blueprint("test", __name__)

# Register routes
test_bp.route("", methods=["GET"])(get_test_table)