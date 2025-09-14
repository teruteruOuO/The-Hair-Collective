import { Link } from "react-router-dom"
import logo from "../assets/images/TheHairCollectiveLogo.png";
import { useState, useEffect, useRef } from "react";
import { useAdminStore } from "../stores/admin";
import { useNavigate } from "react-router-dom";
import api from "../helpers/api";

export default function HeaderComponent() {
    const { admin, setAdmin } = useAdminStore((s) => s)
    const [, setScreenWidth] = useState(window.innerWidth);
    const [isPhone, setIsPhone] = useState(window.innerWidth <= 667);
    const [openMenu, setOpenMenu] = useState(false);
    const mobileNavigation = useRef(null);
    const buttonRef = useRef(null);

    // Logout variables
    const navigate = useNavigate();
    const [, setLogoutFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

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

    // Logout Function
    async function logoutAdmin(e) {
        e.stopPropagation();

        setLogoutFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const response = await api.post('/api/authentication/logout');
            console.log(response.data.message);
            console.log("Logout Data Information:", response);

            setLogoutFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            // Set global admin variable (admin.logged_in) to true
            setAdmin(prev => ({ ...prev, logged_in: false }));

            // Reroute to the home page
            navigate("/");

        } catch (error) {
            console.error(`An error occured while logging out the admin`);
            let message;

            // Handle errors returned from the backend
            if (error.response) {
                console.error("Backend error:", error.response);
                message = error.response.data.message;

            // Handle unexpected errors
            } else {
                console.error("Unexpected error:", error.message);
                message = "An unexpected error happend with the component itself. Refresh the page or try contacting the admin.";
            }

            setLogoutFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

        } finally {
            setLogoutFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
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

                            {admin.logged_in && (
                            <>
                                <li><Link to="/panel" onClick={() => setOpenMenu(false)}>Panel</Link></li>
                                <li>
                                    <Link to="#"
                                        onClick={(e) => {
                                        e.preventDefault();      // stop navigation
                                        setOpenMenu(false);      // close the menu
                                        logoutAdmin(e);          
                                    }}
                                    >
                                        Logout
                                    </Link>
                                </li>
                            </>
                            )}
                            
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

                        
                        {admin.logged_in && (
                        <>
                            <li><Link to="/panel">Panel</Link></li>
                            <li>
                                <Link to="#" 
                                onClick={(e) => {
                                    e.preventDefault();      // stop navigation
                                    logoutAdmin(e);          
                                }}>
                                    Logout
                                </Link>
                            </li>
                        </>
                        )}
                    </ul>
                )}  
            </nav>
        </header>
        </>
        

    );
}