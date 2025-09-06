import { useState, useEffect } from 'react';
import api from '../../helpers/api';
import axios from 'axios';

export default function FeaturedStylesComponent() {
    const [images, setImages] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: false
    });

    useEffect(() => {
        const controller = new AbortController();
        retrieveImages();

        // Retrieve image function
        async function retrieveImages() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = {
                    page_name: "home",
                    image_type: "featured"
                }
                const response = await api.get('/api/slideshow', { 
                    params: parameters,
                    signal: controller.signal 
                });
                console.log(response.data.message);
                console.log("Retrieve Featured Images Data Information:", response);

                setImages(response.data.images);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the images
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for featured images, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the featured images`);
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
        <section id="featured-styles">
            {pageFeedback.isLoading && (
                <section className="loader">
                </section>
            )}

            {(!pageFeedback.success) && (
                <section className="feedback fail">
                    Error Retrieval
                </section>
            )}

            {(images.length <= 0) && (
                <section className="feedback fail">
                    Please add at least one image
                </section>
            )}

            {(images.length > 0) && (
                <section className="featured">
                    <section className="excellence">
                        <h2>Discover Your Best Look</h2>
                        <p>
                            At The Hair Collective, we’re passionate about helping you look and feel your best. From precision cuts and vibrant color to Japanese straightening, wave perms, extensions, and nourishing treatments, we offer a full range of services for both men and women. Our talented team is here to deliver expert care with a personal touch—so every visit leaves you feeling refreshed, confident, and beautiful.
                        </p>
                    </section>

                    <section className="images">
                        {images.map((image, index) => (
                        <img key={image.id} src={image.source} alt={`Featured ${index + 1}`} />
                        ))}
                    </section>
                </section>
            )}  
        </section>
    );
}