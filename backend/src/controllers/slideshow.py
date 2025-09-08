from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload, ImageType, PageName
from src.models.database_script import DatabaseScript
from typing import TypedDict, List, Any, Dict, cast
from src.config.s3_bucket import PersonalS3Bucket

# Store the user's slideshow image information to the database
def add_slideshow_image():
    try:
        select_query: str
        insert_query: str
        select_query_result: List[Any]
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        image_location: str = jsonData.get("image_location")
        image_type: ImageType = jsonData.get("image_type")
        page_name: PageName = jsonData.get("page_name")
        max_featured_images_count = 6

        current_app.logger.debug("Processing add_slideshow_image...")

        # Ensure request body attributes are submitted
        if (not image_location) or (not image_type) or (not page_name):
            raise AppError(
                message=f"{admin_information['email']} did not provide image location, image type, or page name of the image",
                frontend_message="Please provide the image's location and type, and the page's name",
                status_code=400
            )
        
        # Ensure image type is either slideshow, featured, or stylist
        current_app.logger.debug(f"Checking if {admin_information['email']}'s image type ({image_type}) is valid...")
        if image_type not in ("slideshow", "featured", "stylist"):
            raise AppError(
                message=f"Invalid image type: {image_type}",
                frontend_message="Image type must be one of slideshow, featured, or stylist",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']}'s image type is valid!")

        # Ensure page name is either home, our-team, services, or contact
        current_app.logger.debug(f"Checking if {admin_information['email']}'s page name ({page_name}) is valid...")
        if page_name not in ("home", "our-team", "services", "contact"):
            raise AppError(
                message=f"Invalid page name: {page_name}",
                frontend_message="Image type must be one of home, our-team, services, or contact",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']}'s page name ({page_name}) is valid!")

        # If image type is FEATURED and already has 6 images, THROW AN ERROR
        if image_type == "featured":
            current_app.logger.debug(f"Checking if the current count of featured images is {max_featured_images_count}...")
            select_query = "SELECT COUNT(SLIDESHOW_ID) AS FEATURED_COUNT FROM SLIDESHOW WHERE SLIDESHOW_TYPE = %s;"
            select_query_result = DatabaseScript.execute_read_query(select_query, ["featured"])

            if select_query_result[0]["FEATURED_COUNT"] >= max_featured_images_count:
                raise AppError(
                    message=f"Featured images count is already 6",
                    frontend_message="Amount of featured images is already 6. Cannot add more",
                    status_code=400
                )
            current_app.logger.debug(f"Featured images count hasn't reached the count of {max_featured_images_count} yet! Passed!")

        # Add the image's information to the database
        current_app.logger.debug(f"Storing {admin_information['email']} image to the database...")
        insert_query = "INSERT INTO SLIDESHOW (SLIDESHOW_IMG, SLIDESHOW_TYPE, PAGE_NAME, ADMIN_ID) VALUES (%s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [image_location, image_type, page_name, admin_information["id"]])
        current_app.logger.debug(f"Successfully added {admin_information['email']} to the database!")

        return jsonify({
            "message": f"Successfully added image",
        }), 201
        
        current_app.logger.debug("")
    except Exception as err:
        raise 

# Retrieve a page's slideshow images
def retrieve_slideshow_images():
    try:
        class Images(TypedDict):
            id: int
            source: str
            image_location: str

        select_query: str
        result_query: List[Any]
        parameters = request.args
        image_type = parameters.get("image_type")
        page_name = parameters.get("page_name")
        images: List[Images] = []

        current_app.logger.debug("Processing retrieve_slideshow_image...")

        # Ensure parameters are valid 
        current_app.logger.debug(f"Checking if image type and page name are found...")
        if (not image_type) or (not page_name):
            raise AppError(
                message=f"User did not provide the image type or page name",
                frontend_message="Please provide the image type and page name",
                status_code=400
            )
        current_app.logger.debug(f"Image type and page name are found!")

        # Ensure image type is valid
        current_app.logger.debug(f"Checking if image type ({image_type}) is valid...")
        if image_type not in ("slideshow", "featured", "stylist"):
             raise AppError(
                message=f"Invalid image type: {image_type}",
                frontend_message="Image type must be one of slideshow, featured, or stylist",
                status_code=400
            )
        image_type = cast(ImageType, image_type)
        current_app.logger.debug(f"Image type ({image_type}) is valid!")

        # Ensure page name is valid
        current_app.logger.debug(f"Checking if page name ({page_name}) is valid...")
        if page_name not in ("home", "our-team", "services", "contact"):
            raise AppError(
                message=f"Invalid page name: {page_name}",
                frontend_message="Page name must be one of home, our-team, services, or contact",
                status_code=400
            )
        page_name = cast(PageName, page_name)
        current_app.logger.debug(f"Page name ({page_name}) is valid!")

        # Retrieve list of slideshow/featured images
        current_app.logger.debug(f"Retrieving {image_type} images for {page_name} page...")
        select_query = "SELECT SLIDESHOW_ID, SLIDESHOW_IMG FROM SLIDESHOW WHERE SLIDESHOW_TYPE = %s AND PAGE_NAME = %s;"
        result_query = DatabaseScript.execute_read_query(select_query, [image_type, page_name])
        current_app.logger.debug(f"Successfully retrieved {image_type} images for {page_name} page!")

        for result in result_query:
            images.append({
                "id": int(result["SLIDESHOW_ID"]),
                "source": PersonalS3Bucket.retrieve_image_url(result["SLIDESHOW_IMG"]),
                "image_location": result["SLIDESHOW_IMG"]
            })

        return jsonify({
            "message": f"Successfully retrieved {image_type} images for {page_name} page",
            "images": images
        }), 200
    
    except Exception as err:
        raise 

# Remove the user's slideshow image information from the database
def delete_slideshow_image():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        slideshow_id: int = cast(int, parameters.get("id"))
        
        current_app.logger.debug("Processing delete_slideshow_image...")

        # Ensure slideshow id is in the parameters
        current_app.logger.debug(f"Checking if slideshow id is in the parameters...")
        if not slideshow_id:
            raise AppError(
                message=f"User did not provide the slideshow id",
                frontend_message="Please provide the image's ID",
                status_code=400
            )
        current_app.logger.debug(f"slideshow id is provided!")

        # Remove the image from the database
        current_app.logger.debug(f"Deleting image #{slideshow_id} from the database...")
        delete_query = "DELETE FROM SLIDESHOW WHERE SLIDESHOW_ID = %s"
        result_query = DatabaseScript.execute_write_query(delete_query, [slideshow_id])
        current_app.logger.debug(f"Successfully removed image #{slideshow_id} from the database!")

        return jsonify({
            "message": f"Successfully deleted the image"
        }), 200

    except Exception as err:
        raise 