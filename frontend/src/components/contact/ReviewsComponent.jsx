import { useState, useEffect } from 'react';
import api from '../../helpers/api'
import axios from 'axios';

export default function ReviewsComponent() {
    const [reviews, setReviews] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    useEffect(() => {   
        const controller = new AbortController(); 
        retrieveReviews();

        // Retrieve image function
        async function retrieveReviews() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const response = await api.get('/api/review/showcase', { signal: controller.signal });
                console.log(response.data.message);
                console.log("Retrieve Reviews Data Information:", response);

                setReviews(response.data.reviews);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the reviews
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for reviews, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the reviewsy`);
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
        <section id="reviews-showcase">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && reviews.length <= 0 && (
                // No reviews
                <section className="feedback">
                    No reviews at the moment...
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && reviews.length > 0 && (
                // Success retrieval
                <section className="review-list fade-in-from-right">
                    <h2>Reviews</h2>
                    <ul>
                        {reviews.map(review => (
                            <li key={review.id}>
                                <p className='review-score'>
                                    <span>Score: </span> 
                                    <span>{review.score} / 5.0  </span> 
                                    <span>{review.date}</span>
                                </p>

                                <p className='review-content'>
                                    {review.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}  
        </section>
    );
}