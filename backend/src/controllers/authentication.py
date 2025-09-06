from flask import jsonify, request, current_app, make_response
from datetime import datetime, timedelta, timezone
from src.types.types import AppError, ICookieToken, IDecodedTokenPayload
from src.models.database_script import DatabaseScript
from typing import TypedDict, List, Optional, Literal, Any
from src.config.login import LoginConfiguration
import bcrypt
import jwt

# Login user
def login_user():
    try:
        class Admin(TypedDict):
            id: int
            email: str
            password: str

        select_query: str
        result_query: List[Any]
        is_logged_in = request.cookies.get("token") 
        jsonData = request.get_json()
        email: str = jsonData.get("email")
        password: str = jsonData.get("password")
        admin: Admin
        is_password_valid: bool
        token: str
        options: ICookieToken

        current_app.logger.debug("Processing login_user...")

        # Ensure user is not logged in
        current_app.logger.debug("Checking if the user is currently logged in...")
        if is_logged_in:
            raise AppError(
                message="User currently has a valid token",
                frontend_message="You must be logged out before logging in",
                status_code=400
            )
        current_app.logger.debug("User is not logged in!")

        # Ensure email and password are submitted
        current_app.logger.debug("Checking if user submitted their email and password...")
        if ((not email) or (not password)):
            raise AppError(
                message="User did not submit either their email or password",
                frontend_message="Email and Password required",
                status_code=400
            )
        current_app.logger.debug(f"User submitted both email {email} and password!")
        
        # Find user's credentials in the database
        current_app.logger.debug(f"Searching user's email {email} in the database...")
        select_query = "SELECT ADMIN_ID, ADMIN_EMAIL, ADMIN_PASSWORD FROM ADMIN WHERE LOWER(ADMIN_EMAIL) = (%s);"
        result_query = DatabaseScript.execute_read_query(select_query, [email])
        if len(result_query) <= 0:
            raise AppError(
                message=f"Cannot find {email} in the database",
                frontend_message="Email does not exist",
                status_code=404
            )
        current_app.logger.debug(f"Successfully found {email} in the database!")

        admin = {
            "id": result_query[0]["ADMIN_ID"],
            "email": result_query[0]["ADMIN_EMAIL"],
            "password": result_query[0]["ADMIN_PASSWORD"],
        }

        # Ensure user's passwords matche
        current_app.logger.debug(f"Checking if user {admin["email"]}'s submitted password matches the one in the database...")
        is_password_valid = bcrypt.checkpw(
            password.encode(LoginConfiguration.ENCODING), 
            admin["password"].encode(LoginConfiguration.ENCODING)
        )
        if not is_password_valid:
            raise AppError(
                message=f"User {admin['email']}'s password does not match the one in the database",
                frontend_message="Invalid credentials!",
                status_code=400
            )
        current_app.logger.debug(f"{admin['email']}'s password matches the one in the database! {is_password_valid}")
        admin["password"] = ""

        # Configure token
        current_app.logger.debug(f"Configuring {admin['email']}'s login token...")
        token = jwt.encode(
            {"id": admin["id"], "email": admin["email"], "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
            LoginConfiguration.JWT_SECRET,
            algorithm=LoginConfiguration.ALGORITHM
        )
        
        options = LoginConfiguration().get_login_options()
        response = make_response(
            jsonify(
                    {
                        "message": "Login success", 
                        "logged_in": True
                    }
                )
            )
        response.set_cookie("token", token, **options)
        current_app.logger.debug(f"Successfully configured {admin['email']}'s login configuration!")

        return response

        # make_response(...) → gives you a full Response object that you can further modify 
        # before returning (e.g. set cookies, headers).
    except Exception as err:
        raise 

# Logout user
def logout_user():
    try: 
        class Admin(TypedDict):
            id: str
            email: str

        token = request.cookies.get("token") 
        decoded = IDecodedTokenPayload
        admin: Admin

        current_app.logger.debug("Processing logout_user...")

        # Ensure user has a token
        current_app.logger.debug("Checking if user has a token...")
        if not token:
            raise AppError(
                message="User does not have a token",
                frontend_message="You have no token",
                status_code=401 
            )
        current_app.logger.debug("User has a token!")

        # Decode the user's token information
        current_app.logger.debug("Checking which user is logged out...")
        decoded = jwt.decode(
            token,
            LoginConfiguration.JWT_SECRET,
            algorithms=[LoginConfiguration.ALGORITHM]
        )
        admin = {
            "id": decoded.get("id"),
            "email": decoded.get("email")
        }
        current_app.logger.debug(f"Token identified. ID {admin['id']}; Email: {admin['email']}")

        # Clear user's token
        current_app.logger.debug(f"Deleting {admin['email']}'s cookie information...")
        response = make_response(
            jsonify({
                "message": "Successfully logged out"
            })
        )
        response.delete_cookie("token")
        current_app.logger.debug(f"Successfully removed {admin['email']}'s cookie information!")

        return response

        # current_app.logger.debug("")
    except Exception as err:
        raise
