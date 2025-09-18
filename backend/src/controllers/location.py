from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload
from src.models.database_script import DatabaseScript
from typing import Any, List, Any, Dict, cast, TypedDict
from src.config.s3_bucket import PersonalS3Bucket
from src.helpers.neutralize_string import neutralize_string
from src.helpers.neutralize_string import capitalize_words

# Add a location
def add_location():
    try:
        class Location(TypedDict):
            name: str
            address: str
            city: str
            state: str
            zip: str
            phone: str

        insert_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        location: Location = {
            "name": jsonData.get("name"),
            "address": jsonData.get("address"),
            "city": jsonData.get("city"),
            "state": jsonData.get("state"),
            "zip": jsonData.get("zip"),
            "phone": jsonData.get("phone")
        }

        current_app.logger.debug("Processing add_location...")

        # Ensure required request body variables are submitted
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the location's name, address, city, state, zip, or phone...")
        if (not location['name']) or (not location['address']) or (not location['city']) or (not location['state']) or (not location['zip']) or (not location['phone']):
            raise AppError(
                message=f"{admin_information['email']} did not provide the location's name, address, city, state, zip, or phone",
                frontend_message="Please provide the location's name, address, city, state, zip, and phone",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the location's name, address, city, state, zip, and phone!")

        # neutralize strings
        location["name"] = neutralize_string(location['name'], True)
        location["address"] = neutralize_string(location['address'], True)
        location["city"] = neutralize_string(location['city'], True)
        location["state"] = neutralize_string(location['state'], False)
        location["zip"] = neutralize_string(location['zip'], False)
        location["phone"] = neutralize_string(location['phone'], False)

        # Add location to the database
        current_app.logger.debug(f"Adding location {location['name']} to the database...")
        insert_query = "INSERT INTO LOCATION (LOCATION_NAME, LOCATION_ADDRESS, LOCATION_CITY, LOCATION_STATE, LOCATION_ZIP, LOCATION_PHONE, ADMIN_ID) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [
            location['name'],
            location['address'],
            location['city'],
            location['state'],
            location['zip'],
            location['phone'],
            admin_information['id']
        ])
        current_app.logger.debug(f"Successfully added location {location['name']} to the database!")

        return jsonify({
            "message": f"Successfully added location {location['name'].capitalize()}!",
        }), 201

    except Exception as err:
        raise

# Update a location
def update_location():
    try:
        class Location(TypedDict):
            id: int
            name: str
            address: str
            city: str
            state: str
            zip: str
            phone: str

        update_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        location: Location = {
            "id": int(jsonData.get("id")),
            "name": jsonData.get("name"),
            "address": jsonData.get("address"),
            "city": jsonData.get("city"),
            "state": jsonData.get("state"),
            "zip": jsonData.get("zip"),
            "phone": jsonData.get("phone")
        }

        current_app.logger.debug("Processing update_location...")

        # Ensure required request body variables are submitted
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the location's id, name, address, city, state, zip, or phone...")
        if (not location['id']) or (not location['name']) or (not location['address']) or (not location['city']) or (not location['state']) or (not location['zip']) or (not location['phone']):
            raise AppError(
                message=f"{admin_information['email']} did not provide the location's id, name, address, city, state, zip, or phone",
                frontend_message="Please provide the location's id, name, address, city, state, zip, and phone",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the location's id, name, address, city, state, zip, and phone!")

        # neutralize strings
        location["name"] = neutralize_string(location['name'], True)
        location["address"] = neutralize_string(location['address'], True)
        location["city"] = neutralize_string(location['city'], True)
        location["state"] = neutralize_string(location['state'], False)
        location["zip"] = neutralize_string(location['zip'], False)
        location["phone"] = neutralize_string(location['phone'], False)

        # Add location to the database
        current_app.logger.debug(f"Adding location {location['name']} to the database...")
        update_query = "UPDATE LOCATION SET LOCATION_NAME = %s, LOCATION_ADDRESS = %s, LOCATION_CITY = %s, LOCATION_STATE = %s, LOCATION_ZIP = %s, LOCATION_PHONE = %s, ADMIN_ID = %s WHERE LOCATION_ID = %s;"
        result_query = DatabaseScript.execute_write_query(update_query, [
            location['name'],
            location['address'],
            location['city'],
            location['state'],
            location['zip'],
            location['phone'],
            admin_information['id'],
            location['id']
        ])
        current_app.logger.debug(f"Successfully updated location {location['name']} in the database!")

        return jsonify({
            "message": f"Successfully updated location {location['name'].capitalize()}!",
        }), 200

    except Exception as err:
        raise

# Delete a location 
def delete_location():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        admin_information: IDecodedTokenPayload = g.user
        location_id: int = cast(int, parameters.get("id"))

        current_app.logger.debug("Processing delete_location...")

        # Ensure location id exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the location's id...")
        if not location_id:
            raise AppError(
                message=f"{admin_information['email']} did not provide the location's id",
                frontend_message="Please provide the location's ID",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the location id!")

        # Delete the location from the database
        current_app.logger.debug(f"Deleting the location #{location_id} from the database...")
        delete_query = "DELETE FROM LOCATION WHERE LOCATION_ID = %s;"
        result_query = DatabaseScript.execute_write_query(delete_query, [location_id])
        current_app.logger.debug(f"Successfully deleted location #{location_id} from the database!")

        return jsonify({
            "message": f"Successfully deleted location #{location_id}",
        }), 200
        
    except Exception as err:
        raise 

# Add an opening hour
def add_opening_hour():
    try:
        class OpeningDay(TypedDict):
            location_id: int
            day: str
            start: str
            end: str

        insert_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        opening_day: OpeningDay = {
            "location_id": int(jsonData.get("location_id")),
            "day": jsonData.get("day"),
            "start": jsonData.get("start"),
            "end": jsonData.get("end")
        }

        current_app.logger.debug("Processing add_opening_hour...")

        # Ensure required request body variables are submitted
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the opening hour's day, start, end, and location id...")
        if (not opening_day['location_id']) or (not opening_day['day']) or (not opening_day['start']) or (not opening_day['end']):
            raise AppError(
                message=f"{admin_information['email']} did not provide the opening hour's day, start, end, and location id",
                frontend_message="Please provide the opening hour's day, start, end, and location id",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the opening hour's day, start, end, and location id!")

        # neutralize strings
        opening_day["day"] = neutralize_string(opening_day['day'], True)

        # Add opening hour to the database
        current_app.logger.debug(f"Adding opening hour to the database...")
        insert_query = "INSERT INTO OPENING_HOUR (LOCATION_ID, OPENING_DAY, OPENING_START, OPENING_END) VALUES (%s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [
            opening_day['location_id'],
            opening_day['day'],
            opening_day['start'],
            opening_day['end'],
        ])
        current_app.logger.debug(f"Successfully added opening hour to the database!")

        return jsonify({
            "message": f"Successfully added opening hour!",
        }), 201

    except Exception as err:
        raise

# Update an opening hour
def update_opening_hour():
    try:
        class OpeningDay(TypedDict):
            id: int
            day: str
            start: str
            end: str

        update_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        opening_day: OpeningDay = {
            "id": int(jsonData.get("id")),
            "day": jsonData.get("day"),
            "start": jsonData.get("start"),
            "end": jsonData.get("end")
        }

        current_app.logger.debug("Processing update_opening_hour...")

        # Ensure required request body variables are submitted
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the opening hour's day, start, end, and id...")
        if (not opening_day['id']) or (not opening_day['day']) or (not opening_day['start']) or (not opening_day['end']):
            raise AppError(
                message=f"{admin_information['email']} did not provide the opening hour's day, start, end, and id",
                frontend_message="Please provide the opening hour's day, start, end, and id",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the opening hour's day, start, end, and id!")

        # neutralize strings
        opening_day["day"] = neutralize_string(opening_day['day'], True)

        # Add opening hour to the database
        current_app.logger.debug(f"Updating opening hour #{opening_day['id']} to the database...")
        insert_query = "UPDATE OPENING_HOUR SET OPENING_DAY = %s, OPENING_START = %s, OPENING_END = %s WHERE OPENING_ID = %s;"
        result_query = DatabaseScript.execute_write_query(insert_query, [
            opening_day['day'],
            opening_day['start'],
            opening_day['end'],
            opening_day['id']
        ])
        current_app.logger.debug(f"Successfully updated opening hour #{opening_day['id']} to the database!")

        return jsonify({
            "message": f"Successfully updated opening hour #{opening_day['id']}!",
        }), 200

    except Exception as err:
        raise

# Delete an opening hour 
def delete_opening_hour():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        admin_information: IDecodedTokenPayload = g.user
        opening_id: int = cast(int, parameters.get("id"))

        current_app.logger.debug("Processing delete_opening_hour...")

        # Ensure location id exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the opening's id...")
        if not opening_id:
            raise AppError(
                message=f"{admin_information['email']} did not provide the opening's id",
                frontend_message="Please provide the opening's ID",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the opening id!")

        # Delete the opening from the database
        current_app.logger.debug(f"Deleting the opening #{opening_id} from the database...")
        delete_query = "DELETE FROM OPENING_HOUR WHERE OPENING_ID = %s;"
        result_query = DatabaseScript.execute_write_query(delete_query, [opening_id])
        current_app.logger.debug(f"Successfully deleted opening #{opening_id} from the database!")

        return jsonify({
            "message": f"Successfully deleted opening #{opening_id}",
        }), 200
        
    except Exception as err:
        raise 

# Retrieve all location and its opening days
def retrieve_all_locations():
    try:
        class OpeningHour(TypedDict):
            id: int
            day: str
            start: str
            end: str

        class Location(TypedDict):
            id: int
            name: str
            address: str
            city: str
            state: str
            zip: str
            phone: str
            availabilities: List[OpeningHour]
            
        select_query: str
        result_query: List[Any]
        locations: List[Location] = []

        current_app.logger.debug("Processing retrieve_all_locations...")    

        current_app.logger.debug("Retrieving all locations...")
        select_query = f"""
                    SELECT 
                        L.LOCATION_ID AS LOC_ID,
                        LOCATION_NAME,
                        LOCATION_ADDRESS,
                        LOCATION_CITY,
                        LOCATION_STATE,
                        LOCATION_ZIP,
                        CONCAT(
                            SUBSTRING(LOCATION_PHONE, 1, 3), '-', 
                            SUBSTRING(LOCATION_PHONE, 4, 3), '-', 
                            SUBSTRING(LOCATION_PHONE, 7, 4)
                        ) AS LOCATION_PHONE,
                        O.LOCATION_ID AS LOC_OP_ID,
                        OPENING_ID,
                        OPENING_DAY,
                        DATE_FORMAT(OPENING_START, '%h:%i %p') AS OPENING_START,
                        DATE_FORMAT(OPENING_END, '%h:%i %p') AS OPENING_END
                    FROM LOCATION L 
                    LEFT JOIN OPENING_HOUR O
                    ON L.LOCATION_ID = O.LOCATION_ID
                    ORDER BY 
                        L.LOCATION_ID,
                        FIELD(LOWER(OPENING_DAY),
                            'monday','tuesday','wednesday',
                            'thursday','friday','saturday','sunday'
                        );
                    """
        result_query = DatabaseScript.execute_read_query(select_query)

        if not result_query:
            raise AppError(
                message=f"There are no locations found",
                frontend_message="There are currently no locations",
                status_code=404
            )
        
        current_app.logger.debug("Successfully retrieved all locations!...")

        for result in result_query:
            # Check if location already exists
            location = next((loc for loc in locations if loc["id"] == result["LOC_ID"]), None)

            if not location:
                # Add the location with empty availabilities first
                location = {
                    "id": int(result["LOC_ID"]),
                    "name": capitalize_words(result["LOCATION_NAME"]),
                    "address": capitalize_words(result["LOCATION_ADDRESS"]),
                    "city": capitalize_words(result["LOCATION_CITY"]),
                    "state": result["LOCATION_STATE"],
                    "zip": result["LOCATION_ZIP"],
                    "phone": result["LOCATION_PHONE"],
                    "availabilities": []
                }
                locations.append(cast(Location, location))

            # Only add availability if it exists
            if result["OPENING_ID"] is not None:
                location["availabilities"].append({
                    "id": int(result["OPENING_ID"]),
                    "day": result["OPENING_DAY"].capitalize(),
                    "start": result["OPENING_START"],
                    "end": result["OPENING_END"]
                })


        return jsonify({
            "message": f"Successfully retrieved all locations!",
            "locations": locations
        }), 200

    except Exception as err:
        raise

# Retrieve a location and its opening days
def retrieve_location():
    try:
        class OpeningHour(TypedDict):
            id: int
            day: str
            start: str
            end: str

        class Location(TypedDict):
            id: int
            name: str
            address: str
            city: str
            state: str
            zip: str
            phone: str
            availabilities: List[OpeningHour]
            
        select_query: str
        result_query: List[Any]
        parameters = request.args
        location_id: int = cast(int, parameters.get("id"))
        location: Location 

        current_app.logger.debug("Processing retrieve_location...")    

        # Ensure stylist id is in the parameters
        current_app.logger.debug(f"Checking if location id is in the parameters...")
        if not location_id:
            raise AppError(
                message=f"User did not provide the location id",
                frontend_message="Please provide the location's ID",
                status_code=400
            )
        current_app.logger.debug(f"location id is provided!")

        current_app.logger.debug(f"Retrieving location #{location_id}...")
        select_query = f"""
                    SELECT 
                        L.LOCATION_ID AS LOC_ID,
                        LOCATION_NAME,
                        LOCATION_ADDRESS,
                        LOCATION_CITY,
                        LOCATION_STATE,
                        LOCATION_ZIP,
                        LOCATION_PHONE,
                        O.LOCATION_ID AS LOC_OP_ID,
                        OPENING_ID,
                        OPENING_DAY,
                        DATE_FORMAT(OPENING_START, '%H:%i') AS OPENING_START,
                        DATE_FORMAT(OPENING_END, '%H:%i') AS OPENING_END
                    FROM LOCATION L 
                    LEFT JOIN OPENING_HOUR O
                        ON L.LOCATION_ID = O.LOCATION_ID
                    WHERE L.LOCATION_ID = %s
                    ORDER BY 
                        L.LOCATION_ID,
                        FIELD(LOWER(OPENING_DAY),
                            'monday','tuesday','wednesday',
                            'thursday','friday','saturday','sunday'
                        );
                    """
        result_query = DatabaseScript.execute_read_query(select_query, [location_id])

        if not result_query:
            raise AppError(
                message=f"Location #{location_id} not found",
                frontend_message="Location not found",
                status_code=404
            )
        
        current_app.logger.debug(f"Successfully retrieved location #{location_id}!")

        location = {
            "id": int(result_query[0]["LOC_ID"]),
            "name": result_query[0]["LOCATION_NAME"],
            "address": result_query[0]["LOCATION_ADDRESS"],
            "city": result_query[0]["LOCATION_CITY"],
            "state": result_query[0]["LOCATION_STATE"],
            "zip": result_query[0]["LOCATION_ZIP"],
            "phone": result_query[0]["LOCATION_PHONE"],
            "availabilities": []
        }

        # Add opening hours only if they exist
        for result in result_query:
            if result["OPENING_ID"] is not None:
                location["availabilities"].append({
                    "id": int(result["OPENING_ID"]),
                    "day": result["OPENING_DAY"].capitalize(),
                    "start": result["OPENING_START"],
                    "end": result["OPENING_END"],
                })

        return jsonify({
            "message": f"Successfully retrieved location #{location_id}",
            "location": location
        }), 200

    except Exception as err:
        raise