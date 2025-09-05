import featured1 from '../../assets/images/test/featured1.jpg'
import featured2 from '../../assets/images/test/featured2.jpg'
import featured3 from '../../assets/images/test/featured3.jpg'
import featured4 from '../../assets/images/test/featured4.jpg'
import featured5 from '../../assets/images/test/featured5.jpg'
import featured6 from '../../assets/images/test/featured6.jpg'
import { useState, useEffect } from 'react';

export default function FeaturedStylesComponent() {
    const [images, setImages] = useState([]);
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
                console.log('Retrieving featured images');
                const imageFiles = [
                    {
                        id: 1,
                        source: featured1
                    },
                    {
                        id: 2,
                        source: featured2
                    },
                    {
                        id: 3,
                        source: featured3
                    },
                    {
                        id: 4,
                        source: featured4
                    },
                    {
                        id: 5,
                        source: featured5
                    },
                    {
                        id: 6,
                        source: featured6
                    },
                ]

                setImages(imageFiles);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: "Successfully retrieved featured images",
                    success: true
                }));
                console.log("Successfully retrieved featured images");

            } catch (error) {
                console.error(`An error occured while retrieving featured images`);
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