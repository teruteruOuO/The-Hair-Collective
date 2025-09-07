import { useState, useEffect } from 'react';
import api from '../../helpers/api'
import axios from 'axios';

export default function ServiceListComponent() {
    const [services, setServices] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    useEffect(() => {   
        const controller = new AbortController(); // Scroll down for more information
        retrieveImages();

        // Retrieve image function
        async function retrieveImages() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/service', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Service Data Information:", response);

                setServices(response.data.service_list);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the services
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for services, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the service list`);
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
        <section id="service-list">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && services.length <= 0 && (
                // No services
                <section className="feedback">
                    Please add at least one service and service type
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && services.length > 0 && (
                // Success retrieval
                <section className="service">
                    {services.map(service_type => (
                    <section className="service-type" id={service_type.name.replace(/\s+/g, "-").toLowerCase()} key={service_type.id}>
                        <h2>{service_type.name}</h2>
                        <p>({service_type.description})</p>
                        <ul>
                            {service_type.services.map((service, index) => (
                                <li key={service.id}>
                                    <span>{index + 1}. {service.name}</span>
                                    <span className="dots"></span>  
                                    <span>${service.price}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                    ))}
                </section>
            )}  
        </section>
    );
}