import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from '../../helpers/api'
import axios from 'axios';
import { useLocationStore } from '../../stores/location';
import { useNavigate } from "react-router-dom";
import UpdateLocationComponent from "../../components/REST-Location/UpdateLocationComponent";
import LocationAvailabilitiesComponent from "../../components/REST-Location/LocationAvailabilitiesComponent";

export default function UpdateLocationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { location, setLocation } = useLocationStore((s) => s);
    const [pageFeedback, setPageFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Retrieve location based on id
    useEffect(() => {
        const controller = new AbortController(); 
        retrieveLocation();

        // Retrieve location function
        async function retrieveLocation() {
            setPageFeedback(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = { id: id }
                const response = await api.get('/api/location/', {
                    signal: controller.signal,
                    params: parameters
                });
                console.log(response.data.message);
                console.log(`Retrieve Location #${id} Data Information:`, response);

                // Initialize location 
                setLocation(prev => ({
                    ...prev,
                    id: 0,
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    phone: '',
                    availabilities: [],
                }));

                setLocation(prev => ({
                    ...prev,
                    id: response.data.location.id,
                    name: response.data.location.name,
                    address: response.data.location.address,
                    city: response.data.location.city,
                    state: response.data.location.state,
                    zip: response.data.location.zip,
                    phone: response.data.location.phone,
                    availabilities: response.data.location.availabilities,
                }));

                setPageFeedback(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the location
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for location, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the location`);
                let message;

                // Handle errors returned from the backend
                if (error.response) {
                    console.error("Backend error:", error.response);
                    message = error.response.data.message;

                    window.alert(message);
                    navigate("/locations"); // Go back to locations route
                    

                // Handle unexpected errors
                } else {
                    console.error("Unexpected error:", error.message);
                    message = "An unexpected error happend with the component itself. Refresh the page or try contacting the admin.";
                }

                setPageFeedback(prev => ({
                    ...prev,
                    message: message,
                    success: false
                }));

            } finally {
                setPageFeedback(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        }

        // Cleanup
        return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.version]);

    return (
        <main id="retrieve-location" className="page">
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

            {!pageFeedback.isLoading && pageFeedback.success && (
            <>
            <UpdateLocationComponent />
            <LocationAvailabilitiesComponent />
            </>
            )}
        </main>
    );
}