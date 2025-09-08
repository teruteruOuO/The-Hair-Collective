import { useState, useEffect } from 'react';
import api from '../../helpers/api'
import axios from 'axios';

export default function AllStylistComponent() {
    const [stylists, setStylists] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    useEffect(() => {   
        const controller = new AbortController(); 
        retrieveStylists();

        // Retrieve image function
        async function retrieveStylists() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/stylist', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Stylist Data Information:", response);

                setStylists(response.data.stylists);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the stylists
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for stylists, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the stylists`);
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
        <section id="all-stylist">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && stylists.length <= 0 && (
                // No stylists
                <section className="feedback">
                    No Stylist
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && stylists.length > 0 && (
                // Success retrieval
                <section className="stylists-information">
                    <ul>
                        {stylists.map(stylist => (
                            <li key={stylist.id}>
                                <img src={stylist.source} alt={`${stylist.first} ${stylist.last}`} />
                                <p>{stylist.first}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}  
        </section>
    );
}