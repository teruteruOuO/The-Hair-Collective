from functools import wraps
from flask import request, current_app, g
import jwt 
from src.types.types import AppError
from src.config.login import LoginConfiguration

def authorize_token(f):
    @wraps(f) # @wraps(f) makes decorator transparent, so Flask (and you) still see the original function’s name, docstring, and metadata even though it’s wrapped.
    def decorated_function(*args, **kwargs):
        token = request.cookies.get("token")

        current_app.logger.debug("Processing authorize_token...")

        if not token:
            raise AppError(
                    message=f"User with a missing token is attempting to retrieve a sensitive information",
                    frontend_message="You must be logged in to access this resource.",
                    status_code=404
                )

        try:
            decoded_token = jwt.decode(
                token, 
                LoginConfiguration.JWT_SECRET, 
                algorithms=["HS256"]
            )
            # Store user info in Flask's global context (you can't do req.user like in ExpressJS)
            # You must use g.user each time you want to take the token's decoded information in this case
            g.user = decoded_token
            current_app.logger.debug("A valid token is found!")

        except jwt.ExpiredSignatureError:
            raise AppError(
                    message=f"User's token has been expired",
                    frontend_message="Login session expired. Please login again",
                    status_code=400
                )
        
        except jwt.InvalidTokenError:
            raise AppError(
                    message=f"User's token is invalid",
                    frontend_message="Invalid login information. Please login again",
                    status_code=401
                )

        # args collects any positional arguments.
        # kwargs collects any keyword arguments (like book_id=123).
        # not returning them means the endpoint routes would never run and parameters would not be passed to the routes

        return f(*args, **kwargs)
    
    return decorated_function