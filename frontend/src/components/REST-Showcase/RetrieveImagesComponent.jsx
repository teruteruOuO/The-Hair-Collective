import { useState, useEffect } from 'react';
import api from "../../helpers/api";
import axios from "axios";

export default function RetrieveImagesComponent({ image_type, page_name, slide }) {
    const [images, setImages] = useState({
        list: [],
        new_image_file: null,
        new_image_preview: null,
        version: 1
    });
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [addFeedback, setAddFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [currentDeletingId, setCurrentDeletingId] = useState(null);
    const [deleteFeedback, setDeleteFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Image Change
    function handleImageChange(e) {
        const file = e.target.files[0];

        if (file) {
            setImages(prev => ({
                ...prev,
                new_image_file: file,
                new_image_preview: URL.createObjectURL(file)
            }));
        }
    }

    // Add Stylist
    async function addImage(e) {
        e.stopPropagation();
        e.preventDefault();

        // Ensure image is not empty
        if (!images.new_image_file) {
            setAddFeedback({
                isLoading: false,
                message: "Image is required!",
                success: false
            });

            return;
        }

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            // Step 1: Generate Signed Upload URL
            const imageFile = images.new_image_file;
            const uploadUrlBody = {
                file_name: `${Date.now()}-${imageFile.name}`,
                content_type: imageFile.type,
                image_type: image_type
            }
            const uploadUrlResponse = await api.post('/api/generate_url', uploadUrlBody);
            console.log(uploadUrlResponse.data.message);
            console.log(`Generate Upload URL Response data information:`, uploadUrlResponse);

            // Step 2: Store image information to the database
            const body = {
                image_location: uploadUrlResponse.data.image_location,
                image_type: image_type,
                page_name: page_name
            }
            const response = await api.post(`/api/slideshow`, body);
            console.log(response.data.message);
            console.log(`Add Image Response data information:`, response);

            // Step 3: Upload image to S3
            await axios.put(uploadUrlResponse.data.signed_url, imageFile, {
                headers: { 
                    'Content-Type': uploadUrlBody.content_type 
                },
                withCredentials: false // don't use the backend's cookies for S3 PUT
            });
            console.log(`Successfuly uploaded the image (${uploadUrlResponse.data.image_location}) to the S3 bucket!`);

            window.alert(response.data.message);
            
            setAddFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));
            setImages(prev => ({
                ...prev,
                version: prev.version + 1
            }));   // Reload component

        } catch (error) {
            console.error(`An error occured while adding the image`);
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

            setAddFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

        } finally {
            setAddFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    // Delete an image
    async function deleteImage(image_instance, e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentDeletingId(image_instance.id);   // mark which one is deleting

        const answer = window.confirm(`Are you sure you want to delete image #${image_instance.id}?`);

        if (!answer) {
            setCurrentDeletingId(null);
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            // Step 1: Generate Signed Delete URL
            const deleteParameter = {
                image_location: image_instance.image_location
            }
            const deleteUploadResponse = await api.delete('/api/generate_url', {
                params: deleteParameter
            });
            console.log(deleteUploadResponse.data.message);
            console.log("Delete Upload Data Information:", deleteUploadResponse);

            // Step 2: Delete image from S3
            await axios.delete(deleteUploadResponse.data.image_delete_url, { withCredentials: false });
            console.log("Successfully deleted the image from S3");

            // Step 3: Delete stylist from database
            const parameter = { id: image_instance.id }
            const response = await api.delete('/api/slideshow', {
                params: parameter
            });
            console.log(response.data.message);
            console.log("Delete Image Data Information:", response);

            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);
        
            setImages(prev => ({
                ...prev,
                version: prev.version + 1
            }));

        } catch (error) {
            console.error(`An error occured while deleting the image`);
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

        } finally {
            setDeleteFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
            setCurrentDeletingId(null); 
        }
    }

    useEffect(() => {   
        const controller = new AbortController(); // Scroll down for more information
        retrieveImages();

        // Retrieve image function
        async function retrieveImages() {
            setAddFeedback({
                isLoading: false,
                message: '',
                success: null
            });

            setDeleteFeedback({
                isLoading: false,
                message: '',
                success: null
            });

            setPageFeedBack({
                isLoading: false,
                message: '',
                success: null
            });

            setImages(prev => ({
                ...prev,
                new_image_file: null,
                new_image_preview: null
            }));

            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = {
                    page_name: page_name,
                    image_type: image_type
                }
                const response = await api.get('/api/slideshow', { 
                    params: parameters,
                    signal: controller.signal 
                });
                console.log(response.data.message);
                console.log(`Retrieve Images (${image_type.toUpperCase()} ${page_name.toUpperCase()}) Data Information:`, response);

                setImages(prev => ({
                    ...prev,
                    list: response.data.images
                }));
                setPageFeedBack(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the images
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log(`Request was canceled for images (${image_type.toUpperCase()} ${page_name.toUpperCase()}), ignoring...`);
                    return;
                }

                console.error(`An error occured while retrieving the images (${image_type.toUpperCase()} ${page_name.toUpperCase()})`);
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
    }, [images.version]);

    return (
        <section id="retrieve-images">
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

            {(!pageFeedback.isLoading && pageFeedback.success) && (
                // Success retrieval
                <section className={`images ${slide}`}>
                    <h2>{page_name} ({image_type}) Images</h2>

                    {images.list.length <= 0 && (
                    <section className='empty'>
                        <p>There are no images for this section yet. Please add at least one.</p>
                    </section>
                    )}

                    {addFeedback.success === false && (
                    <section className='feedback fail'>
                        <p>{addFeedback.message}</p>
                    </section>
                    )}

                    {deleteFeedback.success === false && (
                    <section className='feedback fail'>
                        <p>{deleteFeedback.message}</p>
                    </section>
                    )}
                    
                    {images.list.length > 0 && (
                    <section className='image-container'>
                        <ul>
                            {images.list.map((image, index) => (
                            <li key={image.id} className={image_type == 'featured' ? 'featured' : 'slideshow'}>
                                <img
                                src={image.source}
                                alt={`Image ${index + 1}`}
                                />
                                <button type="button"
                                onClick={(e) => deleteImage(image, e)} 
                                disabled={deleteFeedback.isLoading && currentDeletingId === image.id}
                                title="Remove Image">
                                    ✕
                                </button>
                            </li>
                            ))}
                        </ul>
                    </section>
                    )}

                    <section className={`add-image`}>
                        <section className={`buttons ${image_type == 'featured' ? 'featured' : 'slideshow'}`}>
                            <label htmlFor={`image-${page_name}-${image_type}`} className="custom-file-upload">Add Image </label>
                            <input type="file" name="image" id={`image-${page_name}-${image_type}`} accept="image/*" onChange={handleImageChange} />

                            <button type="button" onClick={addImage} disabled={addFeedback.isLoading}>
                                {addFeedback.isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </section>

                        <section className={`image-preview ${image_type == 'featured' ? 'featured' : 'slideshow'}`} >
                            {images.new_image_preview && (
                            <img src={images.new_image_preview} alt="preview" />
                            )}

                            {!images.new_image_preview && (
                            <p>Preview image goes here</p>
                            )}
                        </section>
                    </section>
                </section>
            )}
        </section>
    );
}