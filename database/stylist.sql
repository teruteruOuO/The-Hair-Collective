-- Stylist information

CREATE TABLE STYLIST (
	STYLIST_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,			-- Stylist identification 
    STYLIST_FIRST_NAME VARCHAR(150) NOT NULL,					-- Stylist first name
    STYLIST_LAST_NAME VARCHAR(150) NOT NULL,				    -- Stylist last name
    STYLIST_ADDED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,		-- Date the stylist was added in the record
    STYLIST_PROFILE_IMG TEXT NOT NULL,							-- Profile image src in the S3
    ADMIN_ID INT UNSIGNED NOT NULL,								-- Admin responsible for adding the stylist's information
    FOREIGN KEY (ADMIN_ID)
		REFERENCES ADMIN (ADMIN_ID)
        ON UPDATE CASCADE
);