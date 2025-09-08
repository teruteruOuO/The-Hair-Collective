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
                frontend_message="Please provide the type's id",
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

# Add a service
def add_service():
    try:
        class Service(TypedDict):
            name: str
            price: float
            type_id: int

        insert_query: str
        result_query: Dict[str, Any]
        jsonData = request.get_json()
        admin_information: IDecodedTokenPayload = g.user
        service: Service = {
            "name": jsonData.get("name"),
            "price": float(jsonData.get("price")),
            "type_id": int(jsonData.get("type_id"))
        }

        current_app.logger.debug("Processing add_service...")

        # Ensure service name, price, and type id exist
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the service's name, price, and type...")
        if (not service["name"]) or (not service["price"]) or (not service["type_id"]):
            raise AppError(
                message=f"{admin_information['email']} did not provide the seevice's name, price, or type",
                frontend_message="Please provide the service's name, price, and service type",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the service's name, price, and type!")

        # Neutralize strings
        service["name"] = neutralize_string(service["name"])

        # Add the service to the database
        current_app.logger.debug(f"Adding service {service['name']} to the database...")
        insert_query = "INSERT INTO SERVICE (SERVICE_NAME, SERVICE_PRICE, TYPE_ID, ADMIN_ID) VALUES (%s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [service["name"], service["price"], service["type_id"], admin_information["id"]])
        current_app.logger.debug(f"Successfully added service {service['name']} to the database!")

        return jsonify({
            "message": f"Successfully added service {service['name']}",
        }), 201
        
    except Exception as err:
        raise 

# Update a service
def update_service():
    try:
        class Service(TypedDict):
            id: int
            name: str
            price: float
            type_id: int

        update_query: str
        result_query: Dict[str, Any]
        jsonData = request.get_json()
        admin_information: IDecodedTokenPayload = g.user
        service: Service = {
            "id": int(jsonData.get("id")),
            "name": jsonData.get("name"),
            "price": float(jsonData.get("price")),
            "type_id": int(jsonData.get("type_id"))
        }

        current_app.logger.debug("Processing update_service...")

        # Ensure service id, name, price, and type id exist
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the service's id, name, price, and type...")
        if (not service["name"]) or (not service["price"]) or (not service["type_id"]):
            raise AppError(
                message=f"{admin_information['email']} did not provide the service's id, name, price, or type",
                frontend_message="Please provide the service's id, name, price, and service type",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the service's id, name, price, and type!")

        # Neutralize strings
        service["name"] = neutralize_string(service["name"])

        # Update the service to the database
        current_app.logger.debug(f"Update service {service['name']} to the database...")
        update_query = "UPDATE SERVICE SET SERVICE_NAME = %s, SERVICE_PRICE = %s, TYPE_ID = %s WHERE SERVICE_ID = %s;"
        result_query = DatabaseScript.execute_write_query(update_query, [service["name"], service["price"], service["type_id"], service["id"]])
        current_app.logger.debug(f"Successfully updated service {service['name']} to the database!")

        return jsonify({
            "message": f"Successfully updated service {service['name']}",
        }), 200
        
    except Exception as err:
        raise 

# Delete Service 
def delete_service():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        admin_information: IDecodedTokenPayload = g.user
        service_id: int = cast(int, parameters.get("id"))

        current_app.logger.debug("Processing delete_service...")

        # Ensure type name and description exists
        current_app.logger.debug(f"Checking if {admin_information['email']} submitted the service's id...")
        if not service_id:
            raise AppError(
                message=f"{admin_information['email']} did not provide the service's id",
                frontend_message="Please provide the service's ID",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the type id!")

        # Delete the service from the database
        current_app.logger.debug(f"Deleting the service #{service_id} from the database...")
        delete_query = "DELETE FROM SERVICE WHERE SERVICE_ID = %s;"
        result_query = DatabaseScript.execute_write_query(delete_query, [service_id])
        current_app.logger.debug(f"Successfully deleteD service #{service_id} from the database!")

        return jsonify({
            "message": f"Successfully deleted service #{service_id}",
        }), 200
        
    except Exception as err:
        raise 

# Retrieve all Service Types
def retrieve_services():
    try:
        class Service(TypedDict):
            id: int
            name: str
            price: float
            type_id: int

        class ServiceTypes(TypedDict):
            id: int
            name: str
            description: str
            services: List[Service]

        select_query: str
        result_query: List[Any]
        service_types: List[ServiceTypes] = []
        services: List[Service] = []

        current_app.logger.debug("Processing retrieve_service...")

        # Retrieve all services
        current_app.logger.debug(f"Retrieving all services from the database...")
        select_query = "SELECT SERVICE_ID, SERVICE_NAME, SERVICE_PRICE, TYPE_ID FROM SERVICE ORDER BY SERVICE_PRICE DESC;"
        result_query = DatabaseScript.execute_read_query(select_query)
        current_app.logger.debug(f"Successfully retrieved all services from the database!")

        # Store all services 
        for result in result_query:
            services.append({
                "id": result["SERVICE_ID"],
                "name":  result["SERVICE_NAME"],
                "price":  result["SERVICE_PRICE"],
                "type_id": result["TYPE_ID"]
            })

        # Retrieve all service types
        current_app.logger.debug(f"Retrieving all service types from the database...")
        select_query = "SELECT TYPE_ID, TYPE_NAME, TYPE_DESC FROM TYPE;"
        result_query = DatabaseScript.execute_read_query(select_query)
        current_app.logger.debug(f"Successfully retrieved all service types from the database!")

        # Store all service types
        for result in result_query:
            service_types.append({
                "id": result["TYPE_ID"],
                "name":  result["TYPE_NAME"],
                "description":  result["TYPE_DESC"],
                "services": []
            })

        # Loop through each service
        for service in services:
            # For each service, determine their type id. If it matches the service type, then append it to the service type's list
            for type in service_types:
                if service['type_id'] == type['id']:
                    type["services"].append({
                        "id": service["id"],
                        "name": service["name"],
                        "price": service["price"],
                        "type_id": service["type_id"]
                    })

        return jsonify({
            "message": f"Successfully retrieved all services",
            "service_list": service_types
        }), 200
    
    except Exception as err:
        raise 