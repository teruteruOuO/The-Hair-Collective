from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload, ImageType
from src.models.database_script import DatabaseScript
from typing import Any
from src.config.s3_bucket import PersonalS3Bucket

# Generate an upload url for the image
def generate_signed_upload_url():
    try:
        jsonData = request.get_json()
        file_name: str = jsonData.get("file_name")
        content_type: Any = jsonData.get("content_type")
        image_type: ImageType = jsonData.get("image_type")
        admin_information: IDecodedTokenPayload = g.user
        signed_url: str
        image_location: str

        current_app.logger.debug("Processing generate_signed_upload_url...")

        # Ensure file_name and content type exist in the request body
        current_app.logger.debug(f"Checking if {admin_information['email']} provided the file name, image type, or content type in the request body...")
        if (not file_name) or (not content_type) or (not image_type):
            raise AppError(
                message=f"{admin_information['email']} did not provide file name, image type, or content type of the image",
                frontend_message="Please provide the image's file name, image type, and content type",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']} provided the file name, image type, and content type!")

        # Ensure image type is either slideshow, featured, or stylist
        current_app.logger.debug(f"Checking if {admin_information['email']}'s image type ({image_type}) is valid...")
        if image_type not in ("slideshow", "featured", "stylist"):
             raise AppError(
                message=f"Invalid image type: {image_type}",
                frontend_message="Image type must be one of slideshow, featured, or stylist",
                status_code=400
            )
        current_app.logger.debug(f"{admin_information['email']}'s image type is valid!")
        
        # Generate an upload url for the image
        current_app.logger.debug(f"Generating an upload url for {admin_information['email']}'s image")
        image_location = f"{PersonalS3Bucket.IMAGE_LOCATION[image_type]}/{file_name}"
        signed_url = PersonalS3Bucket.generate_upload_url(
            content_type, 
            image_location
        )
        current_app.logger.debug(f"Successfully generated an upload url for {admin_information['email']}'s image!")

        return jsonify({
            "message": f"Successfully generated an upload url for {file_name}",
            "signed_url": signed_url,
            "image_location": image_location
        }), 201

    except Exception as err:
        raise 

# Generate a delete url for the image
def generate_signed_delete_url():
    try:
        jsonData = request.get_json()
        image_location: str = jsonData.get("image_location")
        admin_information: IDecodedTokenPayload = g.user
        image_delete_url: str

        current_app.logger.debug("Processing generate_signed_delete_url...")

        # Ensure image location is provided
        if not image_location:
            raise AppError(
                message=f"{admin_information['email']} did not provide the current image's location",
                frontend_message="Please provide the image's location",
                status_code=400
            )

        # Generate a delete URL for the image's location
        current_app.logger.debug(f"Generating an S3 delete url for {admin_information['email']}'s image ({image_location})")
        image_delete_url = PersonalS3Bucket.generate_delete_url(image_location)
        current_app.logger.debug(f"Successfully generated an S3 delete url for {admin_information['email']}'s image ({image_location})")

        return jsonify({
            "message": f"Successfully generated a delete url for the image ({image_location})",
            "image_delete_url": image_delete_url
        }), 201

    except Exception as err:
        raise 


