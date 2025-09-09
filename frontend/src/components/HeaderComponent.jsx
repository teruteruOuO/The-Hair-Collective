import { Link } from "react-router-dom"
import logo from "../assets/images/TheHairCollectiveLogo.png";
import { useState, useEffect, useRef } from "react";

export default function HeaderComponent() {
    const [, setScreenWidth] = useState(window.innerWidth);
    const [isPhone, setIsPhone] = useState(window.innerWidth <= 667);
    const [openMenu, setOpenMenu] = useState(false);
    const mobileNavigation = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        // Close mobile-navigation when clicking outside this block or the button
        function handleClickOutside(event) {
            if (
                mobileNavigation.current &&
                buttonRef.current &&
                !mobileNavigation.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpenMenu(false);
            }
        }

        // Determine the current screen width
        function handleResize() {
            const newWidth = window.innerWidth;
            setScreenWidth(newWidth);
            setIsPhone(newWidth <= 667); // updates both true/false
        }

        // Window Resizing
        window.addEventListener("resize", handleResize);

        // Listen for mouse click (release) or touch
        document.addEventListener("click", handleClickOutside);   // 👈 changed
        document.addEventListener("touchend", handleClickOutside); // 👈 changed

        // If the component re-renders or unmounts → the return function runs → event listener is removed.
        /* 
            If you omit the return, every time the component mounts again, another resize listener is added.
            After a while, resizing the window might fire multiple listeners → the state updates multiple times → laggy behavior.
        */
        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("touchend", handleClickOutside);
        }
    }, []);

    // Open Menu function
    function open(e) {
        e.stopPropagation();
        const menu = openMenu ? false : true;
        setOpenMenu(menu);
    }

    return (
        <>
        {isPhone && (
            <section className={`mobile-navigation ${openMenu ? "open" : ""}`}>
                <div className="menu-content" ref={mobileNavigation}>
                    <img src={logo} alt="Logo"  />

                    <nav>
                        <ul>
                            <li><Link to="/" onClick={() => setOpenMenu(false)}>Home</Link></li>
                            <li><Link to="/our-team" onClick={() => setOpenMenu(false)}>Our Team</Link></li>
                            <li><Link to="/services" onClick={() => setOpenMenu(false)}>Services</Link></li>
                            <li><Link to="/contact" onClick={() => setOpenMenu(false)}>Contact</Link></li>
                            <li><Link to="/our-team" onClick={() => setOpenMenu(false)}>Panel</Link></li>
                        </ul>
                    </nav>
                </div>
            </section>
        )}

        <header>
            <img src={logo} alt="" />

            <nav>
                {isPhone && (
                    <section>
                        <button type="button" onClick={open} ref={buttonRef}>
                            Menu
                        </button>
                    </section>
                )}

                {!isPhone && (
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/our-team">Our Team</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/our-team">Panel</Link></li>
                    </ul>
                )}  
            </nav>
        </header>
        </>
        

    );
}