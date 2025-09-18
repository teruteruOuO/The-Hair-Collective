import states from "../../helpers/states";
import { useState, useRef } from "react";
import api from "../../helpers/api";
import { useNavigate } from "react-router-dom";
import { useLocationStore } from "../../stores/location";  

export default function UpdateLocationComponent() {
    const feedbackSection = useRef(null);
    const navigate = useNavigate();
    const { location, setLocation } = useLocationStore((s) => s);
    const [updateFeedback, setUpdateFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [deleteFeedback, setDeleteFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

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

    // Update location
    async function updateLocation(e) {
        e.stopPropagation();
        e.preventDefault();

        setUpdateFeedback({
            isLoading: false,
            message: '',
            success: null
        });

        const answer = window.confirm("Are you sure you want to update this location?");

        if (!answer) {
            return;
        }

        setUpdateFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                id: location.id,
                name: location.name,
                address: location.address,
                city: location.city,
                state: location.state,
                zip: location.zip,
                phone: location.phone
            }
            const response = await api.put('/api/location', body);
            console.log(response.data.message);
            console.log("Update Location Data Information:", response);

            setUpdateFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);
            // Trigger useState of this component's parent to refresh
            setLocation(prev => ({
                ...prev,
                version: prev.version + 1
            }));

        } catch (error) {
            console.error(`An error occured while updating the location`);
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

            setUpdateFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setUpdateFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    // Delete location
    async function deleteLocation(e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });

        const answer = window.confirm("Are you sure you want to delete this location?");

        if (!answer) {
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const response = await api.delete('/api/location', {
                params: { id: location.id }
            });
            console.log(response.data.message);
            console.log("Delete Location Data Information:", response);

            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);
            navigate("/locations");     // Route back to locations

        } catch (error) {
            console.error(`An error occured while deleting the location`);
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

            setDeleteFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setDeleteFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    return (
        <section id="add-location" className="post-location fade-in-from-right">
            <h1>Edit {location.name.toUpperCase()}'s Information</h1>

            <form onSubmit={updateLocation} className="location-form">
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
                        <button type="submit" disabled={updateFeedback.isLoading}>
                            {updateFeedback.isLoading ? 'Updating...' : 'Update'}
                        </button>
                        <button type="button" onClick={deleteLocation} disabled={deleteFeedback.isLoading}>
                            {deleteFeedback.isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                    </li>
                </ul>
            </form>

            <section
            className={`feedback ${updateFeedback.success === false ? "fail" : ""}`}
            ref={feedbackSection}
            >
            {updateFeedback.success === false && <p>{updateFeedback.message}</p>}
            </section>

            <section
            className={`feedback ${deleteFeedback.success === false ? "fail" : ""}`}
            ref={feedbackSection}
            >
            {deleteFeedback.success === false && <p>{deleteFeedback.message}</p>}
            </section>
        </section>
    )
}