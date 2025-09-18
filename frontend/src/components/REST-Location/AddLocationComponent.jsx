import states from "../../helpers/states";
import { useState, useRef } from "react";
import api from "../../helpers/api";
import { useNavigate } from "react-router-dom";   

export default function AddLocationComponent() {
    const [location, setLocation] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });
    const [addFeedback, setAddFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const feedbackSection = useRef(null);
    const navigate = useNavigate();

    // Form inputs
    function handleChange(e) {
        const { name, value } = e.target;
        if (name === "zip") {
            if (/^\d{0,5}$/.test(value)) {
                setLocation(prev => ({ ...prev, [name]: value }));
            }

        } else if (name === "phone") {
            if (/^\d{0,10}$/.test(value)) {
                setLocation(prev => ({ ...prev, [name]: value }));
            }

        } else {
            setLocation(prev => ({ ...prev, [name]: value }));
        }
    }

    // Add Location Form
    async function addLocation(e) {
        e.stopPropagation();
        e.preventDefault();

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                name: location.name,
                address: location.address,
                city: location.city,
                state: location.state,
                zip: location.zip,
                phone: location.phone
            }
            const response = await api.post('/api/location', body);
            console.log(response.data.message);
            console.log("Add Location Data Information:", response);
            
            setAddFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Reroute back to the location table page
            navigate("/locations")


        } catch (error) {
            console.error(`An error occured while adding the location`);
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

            setAddFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setAddFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    return (
        <section id="add-location" className="post-location fade-in-from-right">
            <h1>New Location</h1>

            <form onSubmit={addLocation} className="location-form">
                <ul>
                    <li>
                        <label htmlFor="name">Name: </label>
                        <input type="text" name="name" id="name" value={location.name} onChange={handleChange} required />
                    </li>
                    <li>
                        <label htmlFor="address">Address: </label>
                        <input type="text" name="address" id="address" value={location.address} onChange={handleChange} required />
                    </li>
                    <li>
                        <label htmlFor="city">City: </label>
                        <input type="text" name="city" id="city" value={location.city} onChange={handleChange} required />
                    </li>
                    <li>
                        <label htmlFor="state">State: </label>
                        <select name="state" id="state" value={location.state} onChange={handleChange} required>
                            <option value=""></option>
                            {states.map(state => (
                            <option value={state} key={state}>{state}</option>
                            ))}
                        </select>
                    </li>
                    <li>
                        <label htmlFor="zip">Zip: </label>
                        <input type="text" name="zip" id="zip" value={location.zip} onChange={handleChange} inputMode="numeric" pattern="\d{5}" title="Zip must be 5 digits" required />
                    </li>
                    <li>
                        <label htmlFor="phone">Phone: </label>
                        <input type="text" name="phone" id="phone" value={location.phone} onChange={handleChange} inputMode="numeric" pattern="\d{10}" title="Phone must be 10 digits" required />
                    </li>
                    <li>
                        <button type="submit" disabled={addFeedback.isLoading}>
                            {addFeedback.isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </li>
                </ul>
            </form>

            {addFeedback.success === false && (
            <section className="feedback fail" ref={feedbackSection}>
                <p>{addFeedback.message}</p>
            </section>
            )}
        </section>
    )
}