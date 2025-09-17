from flask import jsonify, request, current_app, g
from src.types.types import AppError, IDecodedTokenPayload, ITransactionQuery
from src.models.database_script import DatabaseScript
from typing import Any, List, Any, Dict, cast, TypedDict, Optional
from src.config.s3_bucket import PersonalS3Bucket
from src.helpers.neutralize_string import neutralize_string

# Add a review
def add_review():
    try:
        class Review(TypedDict):
            id: Optional[int]
            email: str
            score: float
            content: str

        select_query: str
        insert_query: str
        result_query_select_transaction: List[Any]
        result_query: Dict[str, Any]
        transaction_query: List[ITransactionQuery]
        review: Review
        jsonData = request.get_json()
        review: Review = {
            "id": 0,
            "email": jsonData.get("email"),
            "score": float(jsonData.get("score")),
            "content": jsonData.get("content")
        }

        current_app.logger.debug("Processing add_review....")

        # Ensure body payload is not empty
        current_app.logger.debug(f"Checking if a customer submitted their email and their review content...")
        if (not review["email"]) or (not review["score"]) or (not review["content"]):
            raise AppError(
                message=f"Customer did not provide their email and their review content",
                frontend_message="Please provide your email and review content",
                status_code=400
            )
        current_app.logger.debug(f"Customer provided their email and their review content!")

        # Check if the email is already in the database
        current_app.logger.debug(f"Checking if email {review['email']} is already in the database...")
        review['email'] = neutralize_string(review["email"], True)
        select_query = "SELECT CUST_ID, CUST_EMAIL FROM CUSTOMER WHERE LOWER(CUST_EMAIL) = LOWER(%s);"
        result_query_select_transaction = DatabaseScript.execute_read_query(select_query, [review['email']])
        
        # If the email is already stored in the database, check if their latest review took place within 30 days. If true, then throw error
        # Else, add the email in the database as well as their review
        if len(result_query_select_transaction) == 1:
            review["email"] = result_query_select_transaction[0]["CUST_EMAIL"]
            review["id"] = int(result_query_select_transaction[0]["CUST_ID"])
            current_app.logger.debug(f"Found the email {review['email']} (#{review['id']}) in the database!")

            # Throw an error if the customer has already sent a review within the last 30 days
            current_app.logger.debug(f"Checking if {review['email']} has written a review within the last 30 days")
            select_query = "SELECT REVIEW_ID, CUST_ID, DATEDIFF(NOW(), REVIEW_DATE_ADDED) AS DAYS_AGO FROM REVIEW WHERE CUST_ID = %s AND REVIEW_DATE_ADDED >= NOW() - INTERVAL 30 DAY ORDER BY REVIEW_DATE_ADDED DESC LIMIT %s;"
            result_query_select_transaction = DatabaseScript.execute_read_query(select_query, [review["id"], 1])

            if len(result_query_select_transaction) >= 1:
                raise AppError(
                    message=f"Customer {review['email']} has already submitted a review within the last 30 days ({result_query_select_transaction[0]['DAYS_AGO']} days ago)",
                    frontend_message=f"You've already submitted a review within the last 30 days as {review['email'].upper()} ({result_query_select_transaction[0]['DAYS_AGO']} days ago). Come back again later after 30 days",
                    status_code=400
                )
            current_app.logger.debug(f"Seems like customer with the email {review['email']} hasn't sent a review 30 days after their recent one. Next!")

            current_app.logger.debug(f"Adding customer ${review['email']}'s review in the database!")
            insert_query = "INSERT INTO REVIEW (CUST_ID, REVIEW_SCORE, REVIEW_CONTENT) VALUES (%s, %s, %s);"
            result_query = DatabaseScript.execute_write_query(insert_query, [review['id'], review['score'], review['content']])
            current_app.logger.debug(f"Successfully added customer {review['email']}'s review in the database!")

        else:
            current_app.logger.debug(f"Seems like customer with the email {review['email']} is new")

            # Add the customer's information to the customer table as well as their review in the review table
            current_app.logger.debug(f"Adding customer's ({review['email']}) email and review to the database...")
            transaction_query = [
                {
                    "query": "INSERT INTO CUSTOMER (CUST_EMAIL) VALUES (%s);",
                    "params": [review['email']]
                },
                {
                    "query": "INSERT INTO REVIEW (CUST_ID, REVIEW_SCORE, REVIEW_CONTENT) VALUES (LAST_INSERT_ID(), %s, %s);",
                    "params": [review["score"], review['content']]
                }

            ]
            result_query_select_transaction = DatabaseScript.execute_transaction(transaction_query)
            review['id'] = result_query_select_transaction[0]['lastrowid']

            current_app.logger.debug(f"Successfully added customer {review['email']} to the database and their review to the database!")

        
        return jsonify({
            "message": f"Thank you for your review!",
            "email": review["email"]
        }), 201
    
    except Exception as err:
        raise

# Update a review
def update_review():
    try:
        class Review(TypedDict):
            id: int
            score: float
            content: str

        update_query: str
        result_query: Dict[str, Any]
        review: Review
        jsonData = request.get_json()
        review: Review = {
            "id": int(jsonData.get("id")),\
            "score": float(jsonData.get("score")),
            "content": jsonData.get("content")
        }
        
        current_app.logger.debug("Processing update_review...")

        # Ensure body payload is not empty
        current_app.logger.debug(f"Checking if a customer submitted their review id, score, and content...")
        if (not review["id"]) or (not review["score"]) or (not review["content"]):
            raise AppError(
                message=f"Customer did not provide their review id, score, and content",
                frontend_message="Please provide your review id, score, and content",
                status_code=400
            )
        current_app.logger.debug(f"Customer provided their review id, score, and content!")

        current_app.logger.debug(f"Updating the customer's review (#{review['id']}) in the database...")
        update_query = "UPDATE REVIEW SET REVIEW_SCORE = %s, REVIEW_CONTENT = %s, REVIEW_DATE_UPDATED = CURRENT_TIMESTAMP WHERE REVIEW_ID = %s;"
        result_query = DatabaseScript.execute_write_query(update_query, [review["score"], review["content"], review["id"]])
        current_app.logger.debug("Successfully updated the customer's review!")

        return jsonify({
            "message": f"Review update success!",
        }), 200
    
    except Exception as err:
        raise

# Delete a review 
def delete_review():
    try:
        delete_query: str
        result_query: Dict[str, Any]
        parameters = request.args
        review_id: int = cast(int, parameters.get("id"))

        current_app.logger.debug("Processing delete_review...")

        # Ensure review id exists
        current_app.logger.debug(f"Checking if customer submitted the review's id...")
        if not review_id:
            raise AppError(
                message=f"Customer did not provide the review's id",
                frontend_message="Please provide the Review ID",
                status_code=400
            )
        current_app.logger.debug(f"Customer provided the review's id!")

        # Delete the review from the database
        current_app.logger.debug(f"Deleting the review #{review_id} from the database...")
        delete_query = "DELETE FROM REVIEW WHERE REVIEW_ID = %s;"
        result_query = DatabaseScript.execute_write_query(delete_query, [review_id])
        current_app.logger.debug(f"Successfully deleted review #{review_id} from the database!")

        return jsonify({
            "message": "Review delete success!",
        }), 200
        
    except Exception as err:
        raise 

# Retrieve a user's review
def retrieve_review():
    try:
        class Review(TypedDict):
            id: int
            score: float
            content: str
            date_added: str
            date_updated: str
            days_ago: int
        
        select_query: str
        result_query: List[Any]
        review: Review | None = None
        parameters = request.args
        email: str = str(parameters.get("email"))

        current_app.logger.debug("Processing retrieve_review...")

        if email is not None or email.strip() != "":
            email = neutralize_string(email, True)
        
        # Retrieve the customer's most recent review (if they have one)
        current_app.logger.debug("Retrieving a customer's review...")
        select_query = """SELECT 
                            REVIEW_ID, 
                            REVIEW_SCORE,
                            REVIEW_CONTENT,
                            DATE_FORMAT(REVIEW_DATE_ADDED, '%b %e, %Y') AS REVIEW_DATE_ADDED,
                            DATE_FORMAT(REVIEW_DATE_UPDATED, '%b %e, %Y') AS REVIEW_DATE_UPDATED,
                            DATEDIFF(NOW(), REVIEW_DATE_ADDED) AS DAYS_AGO
                        FROM CUSTOMER C
                        JOIN REVIEW R
                        ON C.CUST_ID = R.CUST_ID
                        WHERE LOWER(CUST_EMAIL) = LOWER(%s) 
                        AND REVIEW_DATE_ADDED >= NOW() - INTERVAL 30 DAY ORDER BY REVIEW_DATE_ADDED DESC LIMIT %s;"""
        result_query = DatabaseScript.execute_read_query(select_query, [email, 1])
        current_app.logger.debug("Successfully retrieved a customer's review!")

        if len(result_query) >= 1:
            review = {
                "id": int(result_query[0]["REVIEW_ID"]),
                "score": float(result_query[0]["REVIEW_SCORE"]),
                "content": result_query[0]["REVIEW_CONTENT"],
                "date_added": result_query[0]["REVIEW_DATE_ADDED"],
                "date_updated": result_query[0]["REVIEW_DATE_UPDATED"],
                "days_ago": int(result_query[0]["DAYS_AGO"]),
            }

        return jsonify({
            "message": "Successfully retrieved a customer's review!",
            "review": review
        }), 200
    
    except Exception as err:
        raise 

# Retrieve a list of reviews of with at least 4 scores
def retrieve_reviews():
    try:
        class Review(TypedDict):
            id: int
            score: float
            content: str
            date: str
        
        select_query: str
        result_query: List[Any]
        min_score = 4
        max_result_amount = 10
        reviews: List[Review] = []

        current_app.logger.debug("Processing retrieve_reviews...")

        current_app.logger.debug(f"Retrieving review with at least {min_score} in score...")
        select_query = "SELECT REVIEW_ID, REVIEW_SCORE, REVIEW_CONTENT, DATE_FORMAT(REVIEW_DATE_ADDED, '%b %e, %Y') AS REVIEW_DATE_ADDED FROM REVIEW WHERE REVIEW_SCORE >= %s ORDER BY REVIEW_SCORE DESC LIMIT %s;"
        result_query = DatabaseScript.execute_read_query(select_query, [min_score, max_result_amount])
        current_app.logger.debug(f"Successfully retrieved all reviews with scores at least {min_score} (Limited to {max_result_amount} results)")

        for result in result_query:
            reviews.append({
                "id": int(result['REVIEW_ID']),
                "score": float(result['REVIEW_SCORE']),
                "content": result['REVIEW_CONTENT'],
                "date": result['REVIEW_DATE_ADDED'],
            })
        
        return jsonify({
            "message": "Review retrieve success!",
            "reviews": reviews
        }), 200

    except Exception as err:
        raise 
