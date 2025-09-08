from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload, ImageType
from src.models.database_script import DatabaseScript
from typing import Any, List, Any, Dict, cast, TypedDict
from src.config.s3_bucket import PersonalS3Bucket
from src.helpers.neutralize_string import neutralize_string

# Add a stylist
def add_stylist():
    try:
        insert_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        image_location: str = jsonData.get("image_location")
        first: str = jsonData.get("first")
        last: str = jsonData.get("last")

        current_app.logger.debug("Processing add_stylist...")

        # Ensure image location, first, and last names of stylist is in the body
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the stylist's image location, first, or last names")
        if (not image_location) or (not first) or (not last):
            raise AppError(
                message=f"{admin_information['email']} did not provide the stylist's image location, first, or last names",
                frontend_message="Please provide the stylist's image location, first, and last names",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the stylist image location, first, and last names!")

        # Neutralize strings
        first = neutralize_string(first, True)
        last = neutralize_string(last, True)

        # Add the stylist information to the database
        current_app.logger.debug(f"Adding {first} {last}'s information to the database...")
        insert_query = "INSERT INTO STYLIST (STYLIST_FIRST_NAME, STYLIST_LAST_NAME, STYLIST_PROFILE_IMG, ADMIN_ID) VALUES (%s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [first, last, image_location, admin_information["id"]])
        current_app.logger.debug(f"Successfully added {first} {last} information to the database!")

        return jsonify({
            "message": f"Successfully added {first.capitalize()} {last.capitalize()}'s information!",
        }), 201

    except Exception as err:
        raise

# Update a stylist
def update_stylist():
    try:
        class Stylist(TypedDict):
            id: int
            first: str
            last: str
            image_location: str

        update_query: str
        result_query: Dict[str, Any]
        jsonData = request.get_json()
        admin_information: IDecodedTokenPayload = g.user
        stylist: Stylist = {
            "id": int(jsonData.get("id")),
            "first": jsonData.get("first"),
            "last": jsonData.get("last"),
            "image_location": jsonData.get("image_location")
        }

        current_app.logger.debug("Processing update_stylist...")

        # Ensure stylist id, first, last, and image location exist
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the stylist's id, first, last, and image location...")
        if (not stylist["id"]) or (not stylist["first"]) or (not stylist["last"]) or (not stylist["image_location"]):
            raise AppError(
                message=f"{admin_information['email']} did not provide the stylist's id, first, last, and image location",
                frontend_message="Please provide the stylist's id, first, last, and image location",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the stylist's id, first, last, and image location!")

        # Neutralize strings
        stylist["first"] = neutralize_string(stylist["first"], True)
        stylist["last"] = neutralize_string(stylist["last"], True)

        # Update the stylist information in the database
        current_app.logger.debug(f"Update stylist #{stylist['id']} in the database...")
        update_query = "UPDATE STYLIST SET STYLIST_FIRST_NAME = %s, STYLIST_LAST_NAME = %s, STYLIST_PROFILE_IMG = %s WHERE STYLIST_ID = %s;"
        result_query = DatabaseScript.execute_write_query(update_query, [stylist["first"], stylist["last"], stylist["image_location"], stylist["id"]])
        current_app.logger.debug(f"Successfully updated stylist #{stylist['id']} in the database!")

        return jsonify({
            "message": f"Successfully updated stylist #{stylist['id']}!",
        }), 200
        
    except Exception as err:
        raise 

# Remove a stylist information
def delete_stylist():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        stylist_id: int = cast(int, parameters.get("id"))
        
        current_app.logger.debug("Processing delete_stylist...")

        # Ensure stylist id is in the parameters
        current_app.logger.debug(f"Checking if stylist id is in the parameters...")
        if not stylist_id:
            raise AppError(
                message=f"User did not provide the stylist id",
                frontend_message="Please provide the stylist's ID",
                status_code=400
            )
        current_app.logger.debug(f"stylist id is provided!")

        # Remove the image from the database
        current_app.logger.debug(f"Deleting stylist #{stylist_id} from the database...")
        delete_query = "DELETE FROM STYLIST WHERE STYLIST_ID = %s"
        result_query = DatabaseScript.execute_write_query(delete_query, [stylist_id])
        current_app.logger.debug(f"Successfully removed stylist #{stylist_id} from the database!")

        return jsonify({
            "message": f"Successfully deleted stylist #{stylist_id}"
        }), 200

    except Exception as err:
        raise 

# Retrieve all stylists' informations
def retrieve_all_stylist():
    try:
        class Stylist(TypedDict):
            id: int
            first: str
            last: str
            source: str

        select_query: str
        result_query: List[Any]
        stylists: List[Stylist] = []

        current_app.logger.debug("Processing retrieve_all_stylist...")

        # Retrieve all stylist information
        current_app.logger.debug("Retrieving all stylist information...")
        select_query = "SELECT STYLIST_ID, STYLIST_FIRST_NAME, STYLIST_LAST_NAME, STYLIST_PROFILE_IMG FROM STYLIST;"
        result_query = DatabaseScript.execute_read_query(select_query)
        current_app.logger.debug("Successfully retrieved all stylist information!")

        for result in result_query:
            stylists.append({
                "id": int(result['STYLIST_ID']),
                "first": result['STYLIST_FIRST_NAME'].capitalize(),
                "last": result['STYLIST_LAST_NAME'].capitalize(),
                "source": PersonalS3Bucket.retrieve_image_url(result['STYLIST_PROFILE_IMG']),
            })

        return jsonify({
            "message": "Successfully retrieved all stylist information!",
            "stylists": stylists
        }), 200
    except Exception as err:
        raise

# Retrieve a stylist's informations
def retrieve_stylist():
    try:
        class Stylist(TypedDict):
            id: int
            first: str
            last: str
            source: str
            image_location: str

        parameters = request.args
        stylist_id: int = cast(int, parameters.get("id"))
        select_query: str
        result_query: List[Any]
        stylist: Stylist

        current_app.logger.debug("Processing retrieve_stylist...")

        # Ensure stylist id is in the parameters
        current_app.logger.debug(f"Checking if stylist id is in the parameters...")
        if not stylist_id:
            raise AppError(
                message=f"User did not provide the stylist id",
                frontend_message="Please provide the stylist's ID",
                status_code=400
            )
        current_app.logger.debug(f"stylist id is provided!")

        # Retrieve all stylist information
        current_app.logger.debug(f"Retrieving stylist #{stylist_id}'s information...")
        select_query = "SELECT STYLIST_ID, STYLIST_FIRST_NAME, STYLIST_LAST_NAME, STYLIST_PROFILE_IMG FROM STYLIST WHERE STYLIST_ID = %s;"
        result_query = DatabaseScript.execute_read_query(select_query, [stylist_id])
        current_app.logger.debug(f"Successfully retrieved stylist #{stylist_id}'s information!")

        stylist = {
            "id": int(result_query[0]["STYLIST_ID"]),
            "first": result_query[0]["STYLIST_FIRST_NAME"],
            "last": result_query[0]["STYLIST_LAST_NAME"],
            "source": PersonalS3Bucket.retrieve_image_url(result_query[0]["STYLIST_PROFILE_IMG"]),
            "image_location": result_query[0]["STYLIST_PROFILE_IMG"]
        }

        return jsonify({
            "message": "Successfully retrieved all stylist information!",
            "stylist": stylist
        }), 200
    
    except Exception as err:
        raise