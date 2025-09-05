-- List of service types

CREATE TABLE TYPE (
	TYPE_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,		-- Type identification
    TYPE_NAME VARCHAR(150) NOT NULL,						-- Type name
    TYPE_DATE_ADDED TIMESTAMP DEFAULT CURRENT_TIMESTAMP	 	-- Date the type was recorded
);