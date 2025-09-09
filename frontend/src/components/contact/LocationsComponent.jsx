import { useState, useEffect } from 'react';
import api from '../../helpers/api'
import axios from 'axios';

export default function LocationsComponent() {
    const [locations, setLocations] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    useEffect(() => {   
        const controller = new AbortController();
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

                console.error(`An error occured while retrieving the location list`);
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
        <section id="location-list">
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
                // No locations
                <section className="feedback">
                    Please add at least one location
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && locations.length > 0 && (
                // Success retrieval
                <section className="location">
                    {locations.map(location => (
                    <section id={location.name.replace(/\s+/g, "-").toLowerCase()} key={location.id}>
                        <h2>The Hair Collective | {location.name}</h2>
                        <p className='address'>{location.address}, {location.city}, {location.state} {location.zip}</p>
                        <p className='phone'>Phone Number: {location.phone}</p>

                        <iframe className='map'
                        src={`https://www.google.com/maps/?q=${encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)}&output=embed`} 
                        frameborder="0"
                        allowFullScreen=""
                        >
                        </iframe>

                        <section className='opening-hours'>
                            <h3>Opening Hours</h3>
                            <ul>
                                {location.availabilities.map(availability => (
                                <li key={availability.id}>
                                    <span>{availability.day}</span> {availability.start} - {availability.end}
                                </li>   
                                ))}
                            </ul>
                        </section>
                    </section>
                    ))}
                </section>
            )}  
        </section>
    );
}