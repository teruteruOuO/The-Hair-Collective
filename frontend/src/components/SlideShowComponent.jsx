import red from '../assets/images/test/red.jpg'
import yellow from '../assets/images/test/yellow.jpg'
import green from '../assets/images/test/green.jpg'
import { useState, useEffect } from 'react';

export default function SlideShowComponent({ title }) {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: false
    });

    useEffect(() => {
        retrieveImages();

        // Retrieve image function
        async function retrieveImages() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                console.log('Retrieving slideshow images');
                const imageFiles = [
                    {
                        id: 1,
                        source: red
                    },
                    {
                        id: 2,
                        source: yellow
                    },
                    {
                        id: 3,
                        source: green
                    },
                ]

                setImages(imageFiles);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: "Successfully retrieved slideshow images",
                    success: true
                }));
                console.log('Successfully retrieved slideshow images');

            } catch (error) {
                console.error(`An error occured while retrieving the slideshow images`);
                console(error);

                setPageFeedBack(prev => ({
                    ...prev,
                    message: "Error occured",
                    success: false
                }));

            } finally {
                setPageFeedBack(prev => ({
                    ...prev,
                    isLoading: false
                }));
            }
        }
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
                <section className="image-container">
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