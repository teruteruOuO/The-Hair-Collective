import os
import boto3
from botocore.client import Config
from dotenv import load_dotenv
from src.types.types import IBucket, IBookLocations
load_dotenv()

class PersonalS3Bucket:
    """
    Access key of the s3 user allowed to make changes in the S3
    """

    USER_WITH_S3_ACCESS: IBucket = {
        "access_key": os.getenv("AWS_ACCESS_KEY_ID", "none"),
        "secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY", "none"),
        "aws_region": os.getenv("AWS_REGION", "none"),
        "s3_bucket": os.getenv("S3_BUCKET", "none")
    }

    IMAGE_LOCATION: IBookLocations = {
        "slideshow": os.getenv("SLIDESHOW_IMG_LOCATION", "none"),
        "featured": os.getenv("FEATURED_IMG_LOCATION", "none"),
        "stylist": os.getenv("STYLIST_IMG_LOCATION", "none")
    }

    # Boto3 S3 client
    s3 = boto3.client(
        "s3",
        region_name = USER_WITH_S3_ACCESS["aws_region"],
        aws_access_key_id = USER_WITH_S3_ACCESS["access_key"],
        aws_secret_access_key = USER_WITH_S3_ACCESS["secret_access_key"],
        config = Config(signature_version="s3v4")  # needed for presigned URLs
    )

    @staticmethod
    def generate_upload_url(content_type: str, image_location: str) -> str:
        """
        Generate a presigned URL for uploading a file.
        :params image_location: folder/filename
        :params content_type: image/png or any other image types
        """
        key: str = image_location

        url = PersonalS3Bucket.s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": PersonalS3Bucket.USER_WITH_S3_ACCESS["s3_bucket"],
                "Key": key,
                "ContentType": content_type
            },
            ExpiresIn = 60 * 5  # 5 minutes
        )
        return url
    
    @staticmethod
    def retrieve_image_url(image_location: str) -> str:
        """
        Generate a presigned URL for retrieving a file.
        """

        url = PersonalS3Bucket.s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": PersonalS3Bucket.USER_WITH_S3_ACCESS["s3_bucket"],
                "Key": image_location
            },
            ExpiresIn=60 * 500  # ~8 hours
        )

        return url
    
    @staticmethod
    def generate_delete_url(image_location: str) -> str:
        """
        Generate a presigned URL for deleting a file.
        """

        url = PersonalS3Bucket.s3.generate_presigned_url(
            ClientMethod="delete_object",
            Params={
                "Bucket": PersonalS3Bucket.USER_WITH_S3_ACCESS["s3_bucket"],
                "Key": image_location
            },
            ExpiresIn=60 * 5  # 5 minutes
        )

        return url