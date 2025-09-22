import { useState, useEffect } from 'react';
import api from '../../helpers/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StylistListComponent() {
    const [stylists, setStylists] = useState([]);
    const navigate = useNavigate();
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Enter each stylist's update page
    function onEnter(id, e) {
        e.preventDefault();
        e.stopPropagation();

        navigate(`/stylist/${id}`);
    }

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
        <section id="all-stylist" className='stylist-list'>
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
                    There are no recorded stylists yet
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && stylists.length > 0 && (
                // Success retrieval
                <section className="stylists-information fade-in-from-left">
                    <ul>
                        {stylists.map((stylist, index) => (
                            <li key={stylist.id} 
                            onClick={(e) => onEnter(stylist.id, e)}
                            className={index % 2 == 0 ? 'fade-in-from-right' : 'fade-in-from-left'}>
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