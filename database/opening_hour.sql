-- List of available times each day for each location 

CREATE TABLE OPENING_HOUR (
	OPENING_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 	-- Opening identification
    LOCATION_ID INT UNSIGNED NOT NULL,						-- Location the opening hours is tied to	
    OPENING_DAY VARCHAR(50) NOT NULL,						-- The day this opening is held
    OPENING_START TIME NOT NULL,							-- Start time
    OPENING_END TIME NOT NULL,								-- End time
    CONSTRAINT chk_opening_day
        CHECK (LOWER(OPENING_DAY) IN 
            ('monday','tuesday','wednesday','thursday',		-- Allowed values for OPENING_DAY
            'friday','saturday','sunday')),
    CONSTRAINT chk_opening_time
        CHECK (OPENING_START < OPENING_END),				-- Ensure start time IS NOT past the end time								
    FOREIGN KEY (LOCATION_ID)
		REFERENCES LOCATION (LOCATION_ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);