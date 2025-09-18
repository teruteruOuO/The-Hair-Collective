import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../../helpers/api'
import axios from 'axios';

export default function AllLocationsComponent() {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Enter each location's update page
    function onEnter(id, e) {
        e.preventDefault();
        e.stopPropagation();

        navigate(`/location/${id}`);
    }

    useEffect(() => {   
        const controller = new AbortController(); // Scroll down for more information
        retrieveLocations();

        // Retrieve locations function
        async function retrieveLocations() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/location', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Location Data Information:", response);

                setLocations(response.data.locations);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the locations
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for locations, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the locations list`);
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

                setPageFeedBack(prev => ({
                    ...prev,
                    message: message,
                    success: false
                }));

            } finally {
                setPageFeedBack(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        }

        // Cleanup
        return () => controller.abort();

    }, []);

    return (
        <section id="all-locations">
            {pageFeedback.isLoading && (
                // Loading
                <section className="loader">
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success === false && (
                // Error during retrieval
                <section className="feedback fail">
                    {pageFeedback.message}
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success === true && locations.length <= 0 && (
                // No services
                <section className="feedback">
                    Please add at least one location
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && locations.length > 0 && (
                // Success retrieval
                <table className="locations-table">
                    <thead>
                        <tr className="fade-in-from-left">
                            <th>Name</th>
                            <th>Address</th>
                        </tr>
                    </thead>

                    <tbody>
                        {locations.map((location, index) => (
                        <tr key={location.id} onClick={(e) => onEnter(location.id, e)}
                        className={index % 2 == 0 ? 'fade-in-from-right' : 'fade-in-from-left'}>
                            <td>{location.name}</td>
                            <td>{location.address}, {location.city} {location.state}, {location.zip}</td>
                        </tr>    
                        ))}
                    </tbody>
                </table>
            )}  
        </section>
    );
}