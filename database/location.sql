-- List of locations

CREATE TABLE LOCATION (
	LOCATION_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 				-- Location identification
    LOCATION_NAME VARCHAR(150) NOT NULL,								-- Location name			
    LOCATION_ADDRESS TEXT NOT NULL,										-- Location address
    LOCATION_PHONE CHAR(12) NOT NULL,									-- Phone number of the location; must be in ###-###-#### format
    LOCATION_DATE_ADDED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,			-- Date the location was recorded in the database
    ADMIN_ID INT UNSIGNED NOT NULL,										-- Admin responsible for adding the location's information
    CONSTRAINT chk_phone_format 
        CHECK (LOCATION_PHONE REGEXP '^[0-9]{3}-[0-9]{3}-[0-9]{4}$'),	-- Phone number must be in ###-###-#### format
    FOREIGN KEY (ADMIN_ID)
		REFERENCES ADMIN (ADMIN_ID)
        ON UPDATE CASCADE
);
