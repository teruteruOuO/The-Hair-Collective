-- Admin account 

CREATE TABLE ADMIN (
	ADMIN_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,		-- Admin identification 
    ADMIN_EMAIL VARCHAR(150) NOT NULL UNIQUE,				-- Admin email; must be unique; used as username
    ADMIN_PASSWORD VARCHAR(300) NOT NULL,					-- Admin password 
    ADMIN_CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP	-- Time the account was created; default at the current time
);

ALTER TABLE ADMIN
ADD CONSTRAINT chk_admin_email_format CHECK (ADMIN_EMAIL LIKE '%_@_%._%'); 	-- Ensure the format goes XXX@XXX.XXX
