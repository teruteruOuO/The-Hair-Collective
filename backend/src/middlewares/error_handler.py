from src.types.types import AppError
from flask import jsonify
import mysql.connector

def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(error: AppError):
        print("Caught a known application error")
        app.logger.error({"err": str(error)}, exc_info=True)
        return jsonify(
            {
                "message": error.frontend_message
            }), error.status_code

    @app.errorhandler(Exception)
    def handle_general_error(error: Exception):
        print("Found an unexpected error")

        # ---------- MySQL specific error handling ----------
        if isinstance(error, mysql.connector.Error):
            sql_message = getattr(error, "msg", "")
            sql_code = getattr(error, "errno", None)

            # ----------- Admin table errors -----------
            # Invalid email format (check constraint)
            if "chk_admin_email_format" in sql_message:
                app.logger.error("Admin did not follow the email format rules")
                return jsonify({"message": "Invalid email format."}), 400
            
            # Attribute value is too long
            if sql_code == 1406 and "ADMIN_EMAIL" in sql_message:
                app.logger.error("Admin email is too long")
                return jsonify({"message": "Admin email is too long (150 Max Characters)"}), 400

            # Attribute value duplicate
            if sql_code == 1062 and "ADMIN_EMAIL" in sql_message:
                app.logger.error("Admin's email is already taken")
                return jsonify({"message": "Email is already taken."}), 409
            
            # Attribute value is too long
            if sql_code == 1406 and "ADMIN_PASSWORD" in sql_message:
                app.logger.error("Admin password is too long")
                return jsonify({"message": "Admin password is too long (300 Max Characters)"}), 400
            
            # ----------- Stylist table errors -----------
            # Attribute value is too long
            if sql_code == 1406 and "STYLIST_FIRST_NAME" in sql_message:
                app.logger.error("Stylist first name is too long")
                return jsonify({"message": "Stylist first name is too long (150 Max Characters)"}), 400
            
            # Attribute value is too long
            if sql_code == 1406 and "STYLIST_LAST_NAME" in sql_message:
                app.logger.error("Stylist last name is too long")
                return jsonify({"message": "Stylist last name is too long (150 Max Characters)"}), 400
            
            # ----------- Type table errors -----------
            # Attribute value is too long
            if sql_code == 1406 and "TYPE_NAME" in sql_message:
                app.logger.error("Type name is too long")
                return jsonify({"message": "Type name is too long (150 Max Characters)"}), 400
            
            # ----------- Service table errors -----------
            # Invalid price format (check constraint)
            if "chk_price" in sql_message:
                app.logger.error("Price is greater than 9999.99")
                return jsonify({"message": "Price must not be greater than 9999.99"}), 400

            # Attribute value is too long
            if sql_code == 1406 and "SERVICE_NAME" in sql_message:
                app.logger.error("Service name is too long")
                return jsonify({"message": "Service name is too long (150 Max Characters)"}), 400
            
            # Attribute value is too long
            if sql_code == 1406 and "SERVICE_DESC" in sql_message:
                app.logger.error("Service description is too long")
                return jsonify({"message": "Service description is too long (150 Max Characters)"}), 400
            
            # ----------- Location table errors -----------
            # Invalid phone format (check constraint)
            if "chk_phone_format" in sql_message:
                app.logger.error("Phone format must be ###-###-####")
                return jsonify({"message": "Phone format must be ###-###-####"}), 400

            # Attribute value is too long
            if sql_code == 1406 and "LOCATION_NAME" in sql_message:
                app.logger.error("Location name is too long")
                return jsonify({"message": "Location name is too long (150 Max Characters)"}), 400
            
             # ----------- Opening hour table errors -----------
            # Invalid opening day format (check constraint)
            if "chk_opening_day" in sql_message:
                app.logger.error("Days must be: monday, tuesday, wednesday, thursday, friday, saturday, sunday")
                return jsonify({"message": "Days must be: monday, tuesday, wednesday, thursday, friday, saturday, sunday"}), 400
            
            # Invalid opening time (check constraint)
            if "chk_opening_time" in sql_message:
                app.logger.error("Start time must take place before the end time")
                return jsonify({"message": "Start time must take place before the end time"}), 400
            
            # ----------- Customer table errors -----------
            # Invalid email format (check constraint)
            if "chk_email_format" in sql_message:
                app.logger.error("Customer did not follow the email format rules")
                return jsonify({"message": "Invalid email format."}), 400

            # Attribute value is too long
            if sql_code == 1406 and "CUST_EMAIL" in sql_message:
                app.logger.error("Customer email is too long")
                return jsonify({"message": "Customer email is too long (150 Max Characters)"}), 400
            
            # ----------- Customer table errors -----------
            # Invalid review score (check constraint)
            if "chk_review_score" in sql_message:
                app.logger.error("Review score must be between 0 and 5")
                return jsonify({"message": "Review score must be between 0 and 5"}), 400


            # -------- Fallback for any other MySQL errors -------- 
            app.logger.error(f"MySQL error {sql_code}: {sql_message}")
            return jsonify({"message": "Database error occurred"}), 500
        
        # ---------- Catch-all for everything else ---------- 
        app.logger.error({"err": str(error)}, exc_info=True)
        return jsonify(
            {
                "message": "Internal Server Error"
            }), 500
    
# Example
# @app.route("/test")
# def test_route():
#     raise AppError("DB connection failed", status_code=500, frontend_message="Cannot connect to database")