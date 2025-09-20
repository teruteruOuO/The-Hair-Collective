import { useServiceStore } from "../../stores/service";
import { useState, useEffect } from "react";
import api from "../../helpers/api";
import axios from "axios";
import RetrieveServiceTypesComponent from "../../components/REST-Services/RetrieveServiceTypesComponent";
import RetrieveServiceInstanceComponent from "../../components/REST-Services/RetrieveServiceInstanceComponent";

export default function RetrieveServicesPage() {
    const { service, setService } = useServiceStore((s) => s);
    const [pageFeedback, setPageFeedback] = useState({
            isLoading: false,
            message: '',
            success: null
        });

    // Retrieve all service types and services
    useEffect(() => {
        const controller = new AbortController(); 
        retrieveServices()

        // Retrieve all services
        async function retrieveServices() {
            setPageFeedback(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/service', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Services Data Response:", response);

                // Store service information
                setService(prev => ( {
                    ...prev,
                    types: response.data.service_list
                }));

                setPageFeedback(prev => ({
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

                console.error(`An error occured while retrieving the services`);
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
    }, [service.version]);

    return (
        <main id="retrieve-services" className="page">
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
            <h1 className="fade-in-from-right">Services</h1>
            <RetrieveServiceTypesComponent />
            <RetrieveServiceInstanceComponent />
            </>
            )}
        </main>
    );
}