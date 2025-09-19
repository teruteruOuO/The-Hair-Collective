import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import api from '../../helpers/api';
import axios from 'axios';

export default function AllReviewsComponent() {
    const { page } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState({
        current_page: 0,
        total_pages: 0,
        total_reviews: 0,
        reviews: [],
    });
    const [pageFeedback, setPageFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Next Page
    function nextPage(e) {
        e.preventDefault();
        e.stopPropagation();

        if (reviews.current_page < reviews.total_pages) {
            const newPage = reviews.current_page + 1;
            navigate(`/reviews/${newPage}`);
        }
    }

    // Previous Page
    function previousPage(e) {
        e.preventDefault();
        e.stopPropagation();

        if (reviews.current_page > 1) {
            const newPage = reviews.current_page - 1
            navigate(`/reviews/${newPage}`);
        }
    }

    useEffect(() => {   
        const controller = new AbortController();
        retrieveReviews();

        // Retrieve reviews function
        async function retrieveReviews() {
            setPageFeedback({
                isLoading: false,
                message: '',
                success: null
            });

            setPageFeedback(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = { page: page }
                const response = await api.get('/api/review/all', {
                    params: parameters, 
                    signal: controller.signal 
                });
                console.log(response.data.message);
                console.log("Retrieve All Reviews Data Information:", response);

                setReviews({
                    current_page: response.data.current_page,
                    total_pages: response.data.total_pages,
                    total_reviews: response.data.total_reviews,
                    reviews: response.data.reviews,
                });
                setPageFeedback(prev => ({
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

                console.error(`An error occured while retrieving all reviews`);
                let message;

                // Handle errors returned from the backend
                if (error.response) {
                    console.error("Backend error:", error.response);
                    message = error.response.data.message;

                    if (error.response.status === 400) {
                        window.alert(message);
                        navigate("/reviews/1");
                    }

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
    }, [page]);

    return (
        <section id="all-reviews">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && (
            // Success
            <>
            <h1>Reviews</h1>

            <section className="review-order">
                {reviews.reviews.map((review, index) => (
                <section id={`review-instance-${review.id}`} 
                className={`review-instance ${index % 2 == 0 ? 'fade-in-from-right' : 'fade-in-from-left'}`} 
                key={review.id}>
                    <section className="header">
                        <p className="score">{review.score} / 5.0</p>
                        <p><span>Submitted by:</span> {review.email}</p>
                    </section>

                    <section className="content">
                        <p>{review.content}</p>
                    </section>

                    <section className="dates">
                        <p><span>Date Recorded:</span> {review.date_added}</p>
                        {review.date_added !== review.date_updated && (
                        <p><span>Last Updated:</span> {review.date_updated}</p>
                        )}
                    </section>
                </section>
                ))}
            </section>

            <section className="pagination-buttons">
                <button type="button" onClick={previousPage} disabled={reviews.current_page <= 1}>
                    Previous
                </button>
                
                <p>
                    {reviews.current_page} / {reviews.total_pages}
                </p>

                <button type="button" onClick={nextPage} disabled={reviews.current_page >= reviews.total_pages}>
                    Next
                </button>
            </section>
            </>
            )}
        </section>
    );
}