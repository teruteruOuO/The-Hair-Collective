-- List of services

CREATE TABLE SERVICE (
	SERVICE_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,			-- Service identification 
    SERVICE_NAME VARCHAR(150) NOT NULL,							-- Service name
    SERVICE_PRICE DECIMAL(6, 2) NOT NULL,				    	-- Service Price
    TYPE_ID INT UNSIGNED NOT NULL,								-- Service's type
    SERVICE_DATE_ADDED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,		-- Date the service was added
    ADMIN_ID INT UNSIGNED NOT NULL,								-- Admin responsible for adding the service's information
    CONSTRAINT chk_price
        CHECK (SERVICE_PRICE <= 9999.99),						-- Ensure price is at most $9999.99
    FOREIGN KEY (ADMIN_ID)
		REFERENCES ADMIN (ADMIN_ID)
        ON UPDATE CASCADE,
	FOREIGN KEY (TYPE_ID)
		REFERENCES TYPE (TYPE_ID)
        ON UPDATE CASCADE
);