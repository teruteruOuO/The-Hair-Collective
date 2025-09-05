-- Customer information 

CREATE TABLE CUSTOMER (
	CUST_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 		-- Customer identification
    CUST_EMAIL VARCHAR(150) NOT NULL UNIQUE,				-- Customer email
    CUST_ADDED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,	-- Time the customer was added to the database
    CONSTRAINT chk_email_format
        CHECK (CUST_EMAIL LIKE '%_@_%._%')					-- Ensure the format goes XXX@XXX.XXX
);