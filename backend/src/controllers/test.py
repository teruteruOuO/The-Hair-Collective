from flask import jsonify, current_app
from src.types.types import AppError  # your custom error class
from src.models.database_script import DatabaseScript
from typing import TypedDict, List, Optional, Literal, Any

# current_app is a proxy to the Flask app instance that’s currently handling the request.
# It works anywhere inside a request/route without having to pass app explicitly.

def get_test_table():
    try:
        class Admins(TypedDict):
            email: str
            recorded: str

        select_query: Optional[str]
        result_query: List[Any]
        admins: List[Admins] = []

        current_app.logger.debug(f"Processing get_test_table...")

        current_app.logger.debug(f"Retrieving the list of admins...")
        select_query = "SELECT * FROM ADMIN;"
        result_query = DatabaseScript.execute_read_query(select_query)

        if len(result_query) <= 0:
            raise AppError(
                f"No admins found",
                404,
                f"No admins found"
            )
        
        for item in result_query:
            admins.append({
                "email": item["ADMIN_EMAIL"],
                "recorded": item["ADMIN_CREATED_DATE"]
            })

        # Example response
        return jsonify({
            "message": "Successfully found admins",
            "admins": admins
        }), 200

    except Exception as err:
        # Raise a custom error to be caught by your error handler
        raise AppError(str(err), status_code=500, frontend_message="Something went wrong")