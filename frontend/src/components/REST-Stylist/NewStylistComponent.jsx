import { useState, useRef } from "react";
import api from "../../helpers/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NewStylistComponent() {
    const navigate = useNavigate();
    const feedbackSection = useRef(null);
    const [stylist, setStylist] = useState({
        image_file: null,
        image_preview: null,
        first: '',
        last: ''
    });
    const [addFeedback, setAddFeedback] = useState({
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
                image_file: file,
                image_preview: URL.createObjectURL(file)
            }))
        }
    }

    // Add Stylist
    async function addStylist(e) {
        e.stopPropagation();
        e.preventDefault();

        // Ensure image is not empty
        if (!stylist.image_file) {
            setAddFeedback({
                isLoading: false,
                message: "Image profile is required!",
                success: false
            });

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {

            // Step 1: Generate Signed Upload URL
            const imageFile = stylist.image_file;
            const uploadUrlBody = {
                file_name: `${Date.now()}-${imageFile.name}`,
                content_type: imageFile.type,
                image_type: "stylist"
            }
            const uploadUrlResponse = await api.post('/api/generate_url', uploadUrlBody);
            console.log(uploadUrlResponse.data.message);
            console.log(`Generate Upload URL Response data information:`, uploadUrlResponse);

            // Step 2: Store stylist information to the database
            const body = {
                image_location: uploadUrlResponse.data.image_location,
                first: stylist.first,
                last: stylist.last
            }
            const response = await api.post(`/api/stylist`, body);
            console.log(response.data.message);
            console.log(`Add Stylist Response data information:`, response);

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

            // Reroute back to the stylists page
            navigate("/stylists");

        } catch (error) {
            console.error(`An error occured while adding the stylist`);
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

            feedbackSection.current.scrollIntoView({ behavior: "smooth", block: "center" });

        } finally {
            setAddFeedback(prev => ({
                ...prev,
                isLoading: false
            }));
        }
    }

    return (
        <section id="new-stylist">
            <h1 className="fade-in-from-right">New Stylist</h1>

            <form onSubmit={addStylist} className="stylist">
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
                            <button type="submit" disabled={addFeedback.isLoading}>
                                {addFeedback.isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </li>
                    </section>

                    <section className="image-preview fade-in-from-right">
                        {stylist.image_preview && (
                        <img src={stylist.image_preview} alt="preview" />
                        )}

                        {!stylist.image_preview && (
                        <p>Preview image goes here</p>
                        )}
                    </section>
                </ul>
            </form>

            <section className="feedback fail" ref={feedbackSection}>
            {addFeedback.success === false && (
                <p>{addFeedback.message}</p>
            )}
            </section>
        </section>
    );
}