import { useState, useEffect, useRef } from 'react';
import api from '../../helpers/api'
import axios from 'axios';
import { useReviewStore } from '../../stores/review';

export default function WriteReviewComponent() {
    const { review, setReview } = useReviewStore((s) => s);
    const [reviewContent, setReviewContent] = useState({
        content: '',
        date_added: '',
        date_updated: '',
        days_ago: null,
        id: null,
        score: '',
        email: '',
        version: 1
    });
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [updateFeedback, setUpdateFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [deleteFeedback, setDeleteFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [addFeedback, setAddFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const feedbackSection = useRef(null);

    // Form input
    function handleChange(e) {
        const { name, value } = e.target;

        // Score constrraint
        if (name === "score") {
            if (value === "") {
                // allow blank while typing
                setReviewContent((prev) => ({ ...prev, score: "" }));
            } else {
                let num = parseFloat(value);
                if (!isNaN(num)) {
                    // clamp between 0 and 5
                    if (num < 0) num = 0;
                    if (num > 5) num = 5;
                    // round to 1 decimal place
                    num = Math.round(num * 10) / 10;

                    setReviewContent((prev) => ({ ...prev, score: num }));
                }
            }
        } else {
            // For inputs without constraints
            setReviewContent((prev) => ({ ...prev, [name]: value }));
        }
    }

    // Add Review
    async function addReview(e) {
        e.stopPropagation();
        e.preventDefault();

        // Ensure content is not empty
        if (!reviewContent.content.trim()) {
            setAddFeedBack({
                isLoading: false,
                message: "Review content is required.",
                success: false
            });

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setAddFeedBack(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                email: review.email ? review.email : reviewContent.email,
                score: reviewContent.score,
                content: reviewContent.content
            }
            const response = await api.post('/api/review', body);
            console.log(response.data.message);
            console.log("Add Review Data Information:", response);
            
            setAddFeedBack(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            // Change version value, which in turn runs the retrieveReview function
            setReviewContent(prev => ({
                ...prev,
                version: prev.version + 1
            }));

            // Store the review content email to the local storage
            if (reviewContent.email) {
                setReview(prev => ({
                    ...prev,
                    email: reviewContent.email
                }));
            }

        } catch (error) {
            console.error(`An error occured while adding the review`);
            let message;

            // Handle errors returned from the backend
            if (error.response) {
                console.error("Backend error:", error.response);
                message = error.response.data.message;

                // Store the review content email to the local storage
                if (reviewContent.email) {
                    setReview(prev => ({
                        ...prev,
                        email: reviewContent.email
                    }));
                }

            // Handle unexpected errors
            } else {
                console.error("Unexpected error:", error.message);
                message = "An unexpected error happend with the component itself. Refresh the page or try contacting the admin.";
            }

            setAddFeedBack(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setAddFeedBack(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    // Update Review
    async function updateReview(e) {
        e.stopPropagation();
        e.preventDefault();

        // Ensure content is not empty
        if (!reviewContent.content.trim()) {
            setUpdateFeedBack({
                isLoading: false,
                message: "Review content is required.",
                success: false
            });

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        const answer = window.confirm("Are you sure you want to update your review?");

        if (!answer) {
            return;
        }

        setUpdateFeedBack(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                id: reviewContent.id,
                score: reviewContent.score,
                content: reviewContent.content
            }
            const response = await api.put('/api/review', body);
            console.log(response.data.message);
            console.log("Update Review Data Information:", response);
            
            setUpdateFeedBack(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            // Change version value, which in turn runs the retrieveReview function
            setReviewContent(prev => ({
                ...prev,
                version: prev.version + 1
            }));

        } catch (error) {
            console.error(`An error occured while updating the review`);
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

            setUpdateFeedBack(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    // Delete Review
    async function deleteReview(e) {
        e.stopPropagation();
        e.preventDefault();

        const answer = window.confirm("Are you sure you want to delete this review?");

        if (!answer) {
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const response = await api.delete('/api/review', {
                params: { id: reviewContent.id }
            });
            console.log(response.data.message);
            console.log("Delete Review Data Information:", response);
            
            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            // Change version value, which in turn runs the retrieveReview function
            setReviewContent(prev => ({
                ...prev,
                version: prev.version + 1
            }));

        } catch (error) {
            console.error(`An error occured while deleting the review`);
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

            setDeleteFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setDeleteFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    useEffect(() => {   
        const controller = new AbortController(); 
        retrieveReview();

        // Retrieve review function
        async function retrieveReview() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = {
                    email: review.email
                }
                const response = await api.get('/api/review', { 
                    signal: controller.signal,
                    params: parameters 
                });
                console.log(response.data.message);
                console.log("Retrieve Review Data Information:", response);

                // First initialize review content to its initial state
                setReviewContent(prev => ({
                    ...prev,
                    content: '',
                    date_added: '',
                    date_updated: '',
                    days_ago: null,
                    id: null,
                    score: '',
                    email: '',
                }));

                // If there's a review content, then update it
                if (response.data.review) {
                    setReviewContent(prev => ({
                        ...prev,
                        content: response.data.review.content,
                        date_added: response.data.review.date_added,
                        date_updated: response.data.review.date_updated,
                        days_ago: Number(response.data.review.days_ago),
                        id: Number(response.data.review.id),
                        score: Number(response.data.review.score)
                    }));
                }
                
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the review
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for review, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the review`);
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

                // Reset values of REST feedbacks
                setUpdateFeedBack( {
                    isLoading: false,
                    message: '',
                    success: null
                });

                setAddFeedBack( {
                    isLoading: false,
                    message: '',
                    success: null
                });

                setDeleteFeedback( {
                    isLoading: false,
                    message: '',
                    success: null
                });
            }
        }

        // Cleanup
        return () => controller.abort();

    // Recall this useEffect each time a new version of the reviewContent updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewContent.version]);

    return (
        <section id="review">
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
                // Success retrieval
                <section className="user-review fade-in-from-left">

                    <h2>{ reviewContent.id ? "Current Review" : "Write a Review" }</h2>

                    <form onSubmit={ reviewContent.id ? updateReview : addReview }>
                        <ul>
                            <div className='review-data'>
                                <li>
                                    <label htmlFor="email">Email: </label>
                                    <input type="email" name="email" id="email" disabled={review.email} value={review.email ? review.email : reviewContent.email} onChange={handleChange} required />
                                </li>
                                <li>
                                    <label htmlFor="score">Score: </label>
                                    <input type="number" name="score" id="score" value={reviewContent.score} min="0" max="5" step="0.1" onChange={handleChange} required />
                                </li>
                            </div>
                            
                            <div className='review-content'>
                                <li>
                                    <label htmlFor="content">Review: </label>
                                    <textarea name="content" id="content" value={reviewContent.content} onChange={handleChange} required >
                                    </textarea>
                                </li>
                            </div>

                            <div className='review-buttons'>
                                {reviewContent.id && (
                                // Show this if there's a retrieved review content
                                <>
                                <li>
                                    <button type="submit" disabled={updateFeedback.isLoading}>
                                        {updateFeedback.isLoading ? "Updating..." : "Update"}
                                    </button>
                                </li>
                                <li>
                                    <button type="button" disabled={deleteFeedback.isLoading} onClick={deleteReview}>
                                        {deleteFeedback.isLoading ? "Deleting..." : "Delete"}
                                    </button>
                                </li>
                                </>
                                )}

                                {!reviewContent.id && (
                                // Show instead if there's no retrieved review content
                                <li>
                                    <button type="submit" disabled={addFeedback.isLoading}>
                                        {addFeedback.isLoading ? "Submitting..." : "Submit"}
                                    </button>
                                </li>
                                )}
                            </div>

                            {reviewContent.id && (
                            <div className='review-dates'>
                                <p>Date Recorded: <span>{reviewContent.date_added} ({reviewContent.days_ago} { reviewContent.days_ago === 1 ? "day" : "days" } ago)</span></p>
                                <p>Last Updated: <span>{reviewContent.date_updated}</span></p>
                            </div>
                            )}
                        </ul>
                    </form>

                    <section className="feedback" ref={feedbackSection}>
                        {addFeedback.message && (
                        <p className={addFeedback.success ? 'success' : 'fail'}>
                            {addFeedback.message}
                        </p>
                        )}

                        {updateFeedback.message && (
                        <p className={updateFeedback.success ? 'success' : 'fail'}>
                            {updateFeedback.message}
                        </p>
                        )}

                        {deleteFeedback.message && (
                        <p className={deleteFeedback.success ? 'success' : 'fail'}>
                            {deleteFeedback.message}
                        </p>
                        )}
                    </section>
                </section>
            )}  
        </section>
    );
}