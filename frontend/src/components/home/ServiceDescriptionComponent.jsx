
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../helpers/api';
import axios from 'axios';
import { HashLink } from 'react-router-hash-link';

export default function ServiceDescriptionComponent() {
    const [service_types, setServiceTypes] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: false
    });

    useEffect(() => {
        const controller = new AbortController();
        retrieveServices();

        // Retrieve image function
        async function retrieveServices() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/service/type', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Service Type Data Information:", response);

                setServiceTypes(response.data.service_types);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));
                console.log("Successfully retrieved services");

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the services
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for service types, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving service types`);
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
        <section id="service-description">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && service_types.length <= 0 && (
                // No Service Types
                <section className="feedback">
                    No available service types
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && service_types.length > 0 && (
                <section className="featured fade-in-from-right">
                    <ul>
                    {service_types.map(service_type => (
                        <li key={service_type.id}>
                            <HashLink to={`/services#${service_type.name.replace(/\s+/g, "-").toLowerCase()}`}>
                                <span>{service_type.name}</span>
                                <span>{service_type.description}</span>
                            </HashLink>
                        </li>
                    ))}
                    </ul>
                </section>
            )}  
        </section>
    );
}