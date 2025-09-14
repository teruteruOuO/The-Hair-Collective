import { useState } from "react";
import { useAdminStore } from "../../stores/admin";
import api from "../../helpers/api";
import { useNavigate } from "react-router-dom";   

export default function LoginComponent() {
    const navigate = useNavigate();
    const { setAdmin } = useAdminStore((s) => s);
    const [loginFeedback, setLoginFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [loginInformation, setLoginInformation] = useState({
        email: '',
        password: ''
    });

    // Form variables
    function handleChange(e) {
        setLoginInformation({
            ...loginInformation,
            [e.target.name]: e.target.value
        });
    }

    // Login function
    async function loginAdmin(e) {
        e.stopPropagation();
        e.preventDefault();
        setLoginFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                email: loginInformation.email || null,
                password: loginInformation.password || null
            }
            const response = await api.post('/api/authentication/login', body);
            console.log(response.data.message);
            console.log("Login Data Information:", response);

            setLoginFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            // Set global admin variable (admin.logged_in) to true
            setAdmin(prev => ({ ...prev, logged_in: true }));

            // Reroute to the panel page
            navigate("/panel");

        } catch (error) {
            console.error(`An error occured while logging in admin ${loginInformation.email}`);
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

            setLoginFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

        } finally {
            setLoginFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }


    return (
        <section id="login-admin" className="component">
            <form onSubmit={loginAdmin}>
                <ul>
                    <li>
                        <label htmlFor="email">Email: </label>
                        <input type="email" name="email" id="email" value={loginInformation.email} onChange={handleChange} required />
                    </li>
                    <li>
                        <label htmlFor="password">Password: </label>
                        <input type="password" name="password" id="password" value={loginInformation.password} onChange={handleChange} required />
                    </li>
                    <li>
                        <label htmlFor="login-submit"></label>
                        <button type="submit" id="login-submit" disabled={loginFeedback.isLoading}>
                            {loginFeedback.isLoading && (
                                "Logging In..."
                            )}
                            {!loginFeedback.isLoading && (
                                "Log In"
                            )}
                        </button>
                    </li>
                </ul>
            </form>

            {loginFeedback.success === false && (
            <section className="feedback fail">
                <p>{ loginFeedback.message }</p>
            </section>
            )}
        </section>
    );
}