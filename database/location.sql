-- List of locations

CREATE TABLE LOCATION (
	LOCATION_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 				-- Location identification
    LOCATION_NAME VARCHAR(150) NOT NULL,								-- Location name			
    LOCATION_ADDRESS TEXT NOT NULL,										-- Location address
    LOCATION_CITY VARCHAR(150) NOT NULL,								-- Location city
    LOCATION_STATE CHAR(2) NOT NULL,									-- Location state
    LOCATION_ZIP CHAR(5) NOT NULL,										-- Location zip
    LOCATION_PHONE CHAR(10) NOT NULL,									-- Phone number of the location; must be in ###-###-#### format
    LOCATION_DATE_ADDED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,			-- Date the location was recorded in the database
    ADMIN_ID INT UNSIGNED NOT NULL,										-- Admin responsible for adding the location's information
    CONSTRAINT chk_phone_format 
        CHECK (LOCATION_PHONE REGEXP '^[0-9]{10}$'),					-- Phone number must be in ########## format
	CONSTRAINT chk_state_valid											-- Ensure these 50 states are the accepted values for location state
		CHECK (LOCATION_STATE IN (
			'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
			'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
			'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
			'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
			'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
		)),
	CONSTRAINT chk_zip_format											-- Ensure location zip accept only numerals
		CHECK (LOCATION_ZIP REGEXP '^[0-9]{5}$'),
    FOREIGN KEY (ADMIN_ID)
		REFERENCES ADMIN (ADMIN_ID)
        ON UPDATE CASCADE
);
