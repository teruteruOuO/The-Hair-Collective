from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload
from src.models.database_script import DatabaseScript
from typing import TypedDict, List, Any, Dict, cast
from src.helpers.neutralize_string import neutralize_string

# Add Service Types
def add_service_types():
    try:
        class ServiceType(TypedDict):
            name: str
            description: str

        insert_query: str
        result_query: Dict[str, Any]
        jsonData = request.get_json()
        admin_information: IDecodedTokenPayload = g.user
        type: ServiceType = {
            "name": jsonData.get("name"),
            "description": jsonData.get("description")
        }

        current_app.logger.debug("Processing add_service_types...")

        # Ensure type name and description exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the type's name and description...")
        if (not type["name"]) or (not type["description"]):
            raise AppError(
                message=f"{admin_information['email']} did not provide the type's name or description",
                frontend_message="Please provide the type's name and description",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the type name and description!")

        # Neutralize strings
        type["name"] = neutralize_string(type["name"])
        type["description"] = neutralize_string(type["description"])

        # Add the service type to the database
        current_app.logger.debug(f"Adding service type {type['name']} to the database...")
        insert_query = "INSERT INTO TYPE (TYPE_NAME, TYPE_DESC) VALUES (%s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [type["name"], type["description"]])
        current_app.logger.debug(f"Successfully added service type {type['name']} to the database!")

        return jsonify({
            "message": f"Successfully added service type {type['name']}",
        }), 201
        
    except Exception as err:
        raise 

# Update Service Type
def update_service_type():
    try:
        class ServiceType(TypedDict):
            id: int
            name: str
            description: str

        update_query: str
        result_query: Dict[str, Any]
        jsonData = request.get_json()
        admin_information: IDecodedTokenPayload = g.user
        type: ServiceType = {
            "id": jsonData.get("id"),
            "name": jsonData.get("name"),
            "description": jsonData.get("description")
        }

        current_app.logger.debug("Processing update_service_type...")

        # Ensure type name and description exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the type's id, name and description...")
        if (not type["name"]) or (not type["description"]):
            raise AppError(
                message=f"{admin_information['email']} did not provide the type's id, name or description",
                frontend_message="Please provide the type's name and description",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the type id, name and description!")

        # Neutralize strings
        type["name"] = neutralize_string(type["name"])
        type["description"] = neutralize_string(type["description"])

        # Update the service type to the database
        current_app.logger.debug(f"Updating service type {type['name']} in the database...")
        update_query = "UPDATE TYPE SET TYPE_NAME = %s, TYPE_DESC = %s WHERE TYPE_ID = %s;"
        result_query = DatabaseScript.execute_write_query(update_query, [type["name"], type["description"], type["id"]])
        current_app.logger.debug(f"Successfully updated service type {type['name']} in the database!")

        return jsonify({
            "message": f"Successfully updated service type {type['name']}",
        }), 200
        
    except Exception as err:
        raise 

# Delete Service Type
def delete_service_type():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        admin_information: IDecodedTokenPayload = g.user
        type_id: int = cast(int, parameters.get("id"))

        current_app.logger.debug("Processing delete_service_type...")

        # Ensure type name and description exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the type's id...")
        if not type_id:
            raise AppError(
                message=f"{admin_information['email']} did not provide the type's id",
                frontend_message="Please provide the type's name and description",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the type id!")

        # Delete the service type to the database
        current_app.logger.debug(f"Deleting the service type #{type_id} in the database...")
        delete_query = "DELETE FROM TYPE WHERE TYPE_ID = %s;"
        result_query = DatabaseScript.execute_write_query(delete_query, [type_id])
        current_app.logger.debug(f"Successfully delete service type #{type_id} in the database!")

        return jsonify({
            "message": f"Successfully deleted service type #{type_id}",
        }), 200
        
    except Exception as err:
        raise 

# Retrieve all Service Types
def retrieve_service_types():
    try:
        class ServiceTypes(TypedDict):
            id: int
            name: str
            description: str

        select_query: str
        result_query: List[Any]
        service_types: List[ServiceTypes] = []

        current_app.logger.debug("Processing retrieve_service_types...")

        # Retrieve all service types
        current_app.logger.debug(f"Retrieving all service types from the database...")
        select_query = "SELECT TYPE_ID, TYPE_NAME, TYPE_DESC FROM TYPE;"
        result_query = DatabaseScript.execute_read_query(select_query)
        current_app.logger.debug(f"Successfully retrieved all service types from the database!")

        for result in result_query:
            service_types.append({
                "id": result["TYPE_ID"],
                "name":  result["TYPE_NAME"],
                "description":  result["TYPE_DESC"]
            })

        return jsonify({
            "message": f"Successfully retrieved all service types",
            "service_types": service_types
        }), 200
    except Exception as err:
        raise 