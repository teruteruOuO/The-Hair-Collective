-- Slideshow images to showcas

CREATE TABLE SLIDESHOW (
	SLIDESHOW_ID INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,				-- Slideshow identification
    SLIDESHOW_IMG TEXT NOT NULL,										-- S3 Image location
	SLIDESHOW_TYPE ENUM('slideshow', 'featured') DEFAULT 'slideshow',	-- Slideshow or Feature
	PAGE_NAME ENUM('home', 'our-team', 'services', 'contact'),			-- Allowed page names
    ADMIN_ID INT UNSIGNED NOT NULL,										-- Admin who upload the picture
    FOREIGN KEY (ADMIN_ID)
		REFERENCES ADMIN (ADMIN_ID)
        ON UPDATE CASCADE
);