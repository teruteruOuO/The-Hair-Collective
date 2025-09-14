import { useState, useEffect } from 'react';
import api from '../helpers/api';
import axios from 'axios';

export default function SlideShowComponent({ title, page_name }) {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
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
                const parameters = {
                    page_name: page_name,
                    image_type: "slideshow"
                }
                const response = await api.get('/api/slideshow', { 
                    params: parameters,
                    signal: controller.signal 
                });
                console.log(response.data.message);
                console.log("Retrieve Slideshow Images Data Information:", response);

                setImages(response.data.images);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the images
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for slideshow images, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the slideshow images`);
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
        return () => controller.abort(); // cleanup network request

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Slideshow logic
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
        setCurrentIndex(prev =>
            prev === images.length - 1 ? 0 : prev + 1
        );
        }, 3000); // 3 seconds per image

        return () => clearInterval(interval); // cleanup
    }, [images]);

    return (
        <section id="slide-show">
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

            {!pageFeedback.isLoading && pageFeedback.success === true && images.length <= 0 && (
                // No images
                <section className="feedback">
                    Please add at least one image
                </section>
            )}

            {!pageFeedback.isLoading && pageFeedback.success && images.length > 0 && (
                // Success retrieval
                <section className="image-container fade-in-from-right">
                    <h1>{title}</h1>
                    {images.map((image, index) => (
                        <img
                        key={image.id}
                        src={image.source}
                        alt={`Slide ${index + 1}`}
                        className={index === currentIndex ? "active" : ""}
                        />
                    ))}
                </section>
            )}  
        </section>
    );
}