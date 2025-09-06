from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload, ImageType, PageName
from src.models.database_script import DatabaseScript
from typing import TypedDict, List, Optional, Literal, Any, Dict, cast
from src.config.s3_bucket import PersonalS3Bucket

# Store the user's slideshow image information to the database
def add_slideshow_image():
    try:
        insert_query: str
        result_query: Dict[str, Any]
        admin_information: IDecodedTokenPayload = g.user
        jsonData = request.get_json()
        image_location: str = jsonData.get("image_location")
        image_type: ImageType = jsonData.get("image_type")
        page_name: PageName = jsonData.get("page_name")

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

        # Add the image's information to the database
        current_app.logger.debug(f"Storing {admin_information['email']} image to the database...")
        insert_query = "INSERT INTO SLIDESHOW (SLIDESHOW_IMG, SLIDESHOW_TYPE, PAGE_NAME, ADMIN_ID) VALUES (%s, %s, %s, %s);"
        result_query = DatabaseScript.execute_write_query(insert_query, [image_location, image_type, page_name, admin_information["id"]])
        current_app.logger.debug(f"Successfully added {admin_information['email']} to the database!")

        return jsonify({
            "message": f"Successfully added image",
        }), 201
        
        # current_app.logger.debug("")
    except Exception as err:
        raise 

def retrieve_slideshow_images():
    try:
        class Images(TypedDict):
            id: int
            source: str

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
                "id": result["SLIDESHOW_ID"],
                "source": PersonalS3Bucket.retrieve_image_url(result["SLIDESHOW_IMG"])
            })

        return jsonify({
            "message": f"Successfully retrieved {image_type} images for {page_name} page",
            "images": images
        }), 200
    
    except Exception as err:
        raise 
