import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../helpers/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UpdateStylistComponent() {
    const navigate = useNavigate();
    const { id } = useParams();
    const feedbackSection = useRef(null);
    const [stylist, setStylist] = useState({
        id: 0,
        new_image_file: null,
        new_image_preview: null,
        image_location: '',
        source: '',
        first: '',
        last: '',
        version: 1
    });
    const [pageFeedback, setPageFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [updateFeedback, setUpdateFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [deleteFeedback, setDeleteFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });

    // Add Form input
    function handleChange(e) {
        const { name, value } = e.target;

        setStylist(prev => ({ ...prev, [name]: value }));
    }

    // Image Change
    function handleImageChange(e) {
        const file = e.target.files[0];

        if (file) {
            setStylist(prev => ({
                ...prev,
                new_image_file: file,
                new_image_preview: URL.createObjectURL(file)
            }));
        }
    }

    // Reset image back to previous
    function resetImage() {
        if (stylist.new_image_preview) {
            URL.revokeObjectURL(stylist.new_image_preview);
        }

        // Reset fields
        setStylist(prev => ({
            ...prev,
            new_image_file: null,
            new_image_preview: null,
        }))
    }

    // Update Stylist
    async function updateStylist(e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });

        const answer = window.confirm(`Are you sure you want to update stylist ${stylist.first.toUpperCase()} ${stylist.last.toUpperCase()}?`);

        if (!answer) {
            return;
        }

        setUpdateFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            let newImageLocation = null;

            // If there's a new image detected, perform this code block
            if (stylist.new_image_file && stylist.new_image_preview) {
                // Step 1: Generate Signed Delete URL
                const deleteParameter = {
                    image_location: stylist.image_location
                }
                const deleteUploadResponse = await api.delete('/api/generate_url', {
                    params: deleteParameter
                });
                console.log(deleteUploadResponse.data.message);
                console.log("Delete Upload Data Information:", deleteUploadResponse);

                // Step 2: Delete image from S3
                await axios.delete(deleteUploadResponse.data.image_delete_url, { withCredentials: false });
                console.log("Successfully deleted the stylist's current image from S3");

                // Step 3: Generate Signed Upload URL
                const imageFile = stylist.new_image_file;
                const uploadUrlBody = {
                    file_name: `${Date.now()}-${imageFile.name}`,
                    content_type: imageFile.type,
                    image_type: "stylist"
                }
                const uploadUrlResponse = await api.post('/api/generate_url', uploadUrlBody);
                console.log(uploadUrlResponse.data.message);
                console.log(`Generate Upload URL Response data information:`, uploadUrlResponse);

                // Step 4: Upload image to S3
                await axios.put(uploadUrlResponse.data.signed_url, imageFile, {
                    headers: { 
                        'Content-Type': uploadUrlBody.content_type 
                    },
                    withCredentials: false // don't use the backend's cookies for S3 PUT
                });
                console.log(`Successfuly uploaded the stylist's new image profile (${uploadUrlResponse.data.image_location}) to the S3 bucket!`);
                newImageLocation = uploadUrlResponse.data.image_location
            }

            // Step 4: Update stylist in the database
            const body = { 
                id: stylist.id,
                first: stylist.first,
                last: stylist.last,
                image_location: newImageLocation ? newImageLocation : stylist.image_location    // If user decided to update the stylist's profile image, then use that instead of the current one
            }
            const response = await api.put('/api/stylist', body);
            console.log(response.data.message);
            console.log("Update Stylist Data Information:", response);

            setUpdateFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);
            setStylist(prev => ({
                ...prev,
                version: prev.version + 1
            }));    // Reload the component
            

        } catch (error) {
            console.error(`An error occured while updating the stylist`);
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

            setUpdateFeedback(prev => ({
                ...prev,
                message: message,
                success: false
            }));

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setUpdateFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    // Delete stylist
    async function deleteStylist(e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });

        const answer = window.confirm(`Are you sure you want to remove stylist ${stylist.first.toUpperCase()} ${stylist.last.toUpperCase()}?`);

        if (!answer) {
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            // Step 1: Generate Signed Delete URL
            const deleteParameter = {
                image_location: stylist.image_location
            }
            const deleteUploadResponse = await api.delete('/api/generate_url', {
                params: deleteParameter
            });
            console.log(deleteUploadResponse.data.message);
            console.log("Delete Upload Data Information:", deleteUploadResponse);

            // Step 2: Delete image from S3
            await axios.delete(deleteUploadResponse.data.image_delete_url, { withCredentials: false });
            console.log("Successfully deleted the stylist's image from S3");

            // Step 3: Delete stylist from database
            const parameter = { id: stylist.id }
            const response = await api.delete('/api/stylist', {
                params: parameter
            });
            console.log(response.data.message);
            console.log("Delete Stylist Data Information:", response);

            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);
            navigate("/stylists");     // Route back to stylists

        } catch (error) {
            console.error(`An error occured while deleting the stylist`);
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

    // Retrieve stylist based on id
    useEffect(() => {
        const controller = new AbortController(); 
        retrieveStylist();

        // Retrieve location function
        async function retrieveStylist() {
            setPageFeedback(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                const parameters = { id: id }
                const response = await api.get('/api/stylist/', {
                    signal: controller.signal,
                    params: parameters
                });
                console.log(response.data.message);
                console.log(`Retrieve Stylist #${id} Data Information:`, response);

                // Initialize stylist 
                setStylist(prev => ({
                    ...prev,
                    id: 0,
                    new_image_file: null,
                    new_image_preview: null,
                    image_location: '',
                    source: '',
                    first: '',
                    last: '',
                }));

                setStylist(prev => ({
                    ...prev,
                    id: response.data.stylist.id,
                    image_location: response.data.stylist.image_location,
                    source: response.data.stylist.source,
                    first: response.data.stylist.first,
                    last: response.data.stylist.last,
                }));

                setPageFeedback(prev => ({
                    ...prev,
                    message: response.data.message,
                    success: true
                }));

            } catch (error) {
                // Perform when user switches to another page while frontend is still requesting for the stylist
                if (axios.isCancel(error) || error.message === "canceled") {
                    console.log("Request was canceled for stylist, ignoring...");
                    return;
                }

                console.error(`An error occured while retrieving the stylist`);
                let message;

                // Handle errors returned from the backend
                if (error.response) {
                    console.error("Backend error:", error.response);
                    message = error.response.data.message;

                    window.alert(message);
                    navigate("/stylists"); // Go back to stylists route
                    

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
    }, [stylist.version]);

    return (
        <section id="new-stylist" className="update-stylist">
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
            <section className="stylist-individual">
                <h1 className="fade-in-from-right">Stylist</h1>

                <form onSubmit={updateStylist} className="stylist">
                    <ul>
                        <section className="information">
                            <li className="fade-in-from-left">
                                <label htmlFor="first">First Name: </label>
                                <input type="text" name="first" id="first"
                                value={stylist.first}
                                onChange={handleChange} 
                                required />
                            </li>
                            <li className="fade-in-from-right">
                                <label htmlFor="last">Last Name: </label>
                                <input type="text" name="last" id="last"
                                value={stylist.last}
                                onChange={handleChange} 
                                required />
                            </li>
                            <li className="fade-in-from-left">
                                <label htmlFor="image" className="custom-file-upload">Change Image </label>
                                <input type="file" name="image" id="image" accept="image/*" onChange={handleImageChange} />
                                <button type="button" onClick={resetImage}>
                                    Revert Image
                                </button>
                            </li>
                            <li className="fade-in-from-right">
                                <button type="submit" disabled={updateFeedback.isLoading}>
                                    {updateFeedback.isLoading ? 'Updating...' : 'Update'}
                                </button>
                                <button type="button" onClick={deleteStylist} disabled={deleteFeedback.isLoading}>
                                    {deleteFeedback.isLoading ? 'Removing...' : 'Remove'}
                                </button>
                            </li>
                        </section>

                        <section className="image-preview fade-in-from-left">
                            {stylist.new_image_preview && (
                            <img src={stylist.new_image_preview} alt="preview" />
                            )}

                            {(!stylist.new_image_preview && stylist.source) && (
                            <img src={stylist.source} alt="preview" />
                            )}
                        </section>
                    </ul>
                </form>

                <section className="feedback fail" ref={feedbackSection}>
                {updateFeedback.success === false && (
                    <p>{updateFeedback.message}</p>
                )}
                {deleteFeedback.success === false && (
                    <p>{deleteFeedback.message}</p>
                )}
                </section>
            </section>
            )}
        </section>
    );
}