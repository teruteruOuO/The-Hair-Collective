-- Review of a customer for services

CREATE TABLE REVIEW (
	REVIEW_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,			-- Review identification
    CUST_ID INT UNSIGNED NOT NULL,								-- Customer who made the review
    REVIEW_SCORE DECIMAL(2, 1) NOT NULL,						-- Review score given by the customer
    REVIEW_CONTENT TEXT NOT NULL,								-- Review content
    REVIEW_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   	-- Time the review was recorded
    CONSTRAINT chk_review_score
        CHECK (REVIEW_SCORE >= 0.0 AND REVIEW_SCORE <= 5.0),	-- Ensure score is between 0 and 5
    FOREIGN KEY (CUST_ID)
		REFERENCES CUSTOMER (CUST_ID)
        ON DELETE CASCADE
);