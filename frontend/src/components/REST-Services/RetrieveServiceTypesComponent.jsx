import { useState, useRef } from "react";
import { useServiceStore } from "../../stores/service";
import api from "../../helpers/api";

export default function RetrieveServiceTypesComponent() {
    const { service, setService } = useServiceStore((s) => s);
    const feedbackSection = useRef(null);
    const [newService, setNewService] = useState({
        name: '',
        description: 'Write a very short description'
    });
    const [addFeedback, setAddFeedback] = useState({
        isLoading: false,
        message: '',
        success: null
    });
    const [currentUpdatingId, setCurrentUpdatingId] = useState(null);
    const [updateFeedback, setUpdateFeedback] = useState({
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

    // Add Form inputs
    function handleAddChange(e) {
        const { name, value } = e.target;
        setNewService(prev => ({ ...prev, [name]: value }));
    }

    // Update Form inputs
    function handleUpdateChange(id, e) {
        // service.types
        const { name, value } = e.target;

        setService(prev => ({
            ...prev,
            types: prev.types.map(type =>
                type.id == id ?
                {...type, [name]: value }
                :
                type
            )
        }));
    }

    // Add service type
    async function addServiceType(e) {
        e.stopPropagation();
        e.preventDefault();

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                name: newService.name,
                description: newService.description
            }
            const response = await api.post('/api/service/type', body);
            console.log(response.data.message);
            console.log("Add Service Type Data Information:", response);
            
            setAddFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while adding the service type`);
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

    // Update Service Type
    async function updateServiceType(type, e) {
        e.stopPropagation();
        e.preventDefault();

        setUpdateFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentUpdatingId(type.id);   // mark which one is updating

        const answer = window.confirm(`Are you sure you want to update service type ${type.name.toUpperCase()}?`);

        if (!answer) {
            setCurrentUpdatingId(null);
            return;
        }

        setUpdateFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                id: type.id,
                name: type.name,
                description: type.description
            }
            const response = await api.put('/api/service/type', body);
            console.log(response.data.message);
            console.log("Update Service Type Data Information:", response);
            
            setUpdateFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while updating the service type`);
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
            setCurrentUpdatingId(null); 
        }
    }

    // Delete Service Type
    async function deleteServiceType(type, e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentDeletingId(type.id);   // mark which one is deleting

        const answer = window.confirm(`Are you sure you want to delete service type ${type.name.toUpperCase()}?`);

        if (!answer) {
            setCurrentDeletingId(null);
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const parameters = { id: type.id }
            const response = await api.delete('/api/service/type', { params: parameters });
            console.log(response.data.message);
            console.log("Delete Service Type Data Information:", response);
            
            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while deleting the service type`);
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
            setCurrentDeletingId(null); 
        }
    }

    return (
        <section id="service-types">
            <h2 className="fade-in-from-left">Service Types</h2>

            <section className="add-service-type">
                <form onSubmit={addServiceType} id="add-service-type-form" className="fade-in-from-right">
                    <ul>
                        <li>
                            <h3>New Service Type</h3>
                        </li>
                        <li>
                            <label htmlFor="name">Name: </label>
                            <input type="text" name="name" id="name" 
                            value={newService.name}
                            onChange={handleAddChange}
                            required
                            />
                        </li>

                        <li>
                            <label htmlFor="description">Description: </label>
                            <textarea name="description" id="description" value={newService.description} onChange={handleAddChange} required>
                            </textarea>
                        </li>

                        <li>
                            <button type="submit" disabled={addFeedback.isLoading}>
                                {addFeedback.isLoading ? "Submitting..." : "Submit"}
                            </button>
                        </li>
                    </ul>
                </form>

                <section className="feedback" ref={feedbackSection}>
                    {addFeedback.success === false && (
                    <p className="fail">{addFeedback.message}</p>
                    )}
                </section>
            </section>

            {service.types.length >= 1 && (
            <section className="update-service-type">
                {service.types.map((type, index) => (
                <div id={`update-service-type-form-${type.id}`} key={type.id} className={index % 2 == 0 ? 'fade-in-from-left' : 'fade-in-from-right'}>
                    <ul>
                        <li>
                            <h3>Service Type #{index + 1}</h3>
                        </li>
                        <li>
                            <label htmlFor={`name-${type.id}-${type.name}`}>Name: </label>
                            <input type="text" name="name" id={`name-${type.id}-${type.name}`}
                            value={type.name}
                            onChange={(e) => handleUpdateChange(type.id, e)}
                            required
                            />
                        </li>

                        <li>
                            <label htmlFor={`description-${type.id}-${type.description}`}>Description: </label>
                            <textarea name="description" id={`description-${type.id}-${type.description}`} value={type.description} onChange={(e) => handleUpdateChange(type.id, e)} required>
                            </textarea>
                        </li>

                        <li>
                            <button type="button" 
                            onClick={(e) => updateServiceType(type, e)}
                            disabled={updateFeedback.isLoading && currentUpdatingId === type.id}>
                                {updateFeedback.isLoading && currentUpdatingId === type.id
                                ? "Updating..."
                                : "Update"
                                }
                            </button>
                            <button type="button"
                            onClick={(e) => deleteServiceType(type, e)} 
                            disabled={deleteFeedback.isLoading && currentDeletingId === type.id}>
                                {deleteFeedback.isLoading && currentDeletingId === type.id
                                ? "Deleting..."
                                : "Delete"
                                }
                            </button>
                        </li>
                    </ul>
                </div>
                ))}

                <section className="update-feedbacks">
                    <section className={`feedback ${updateFeedback.success === false ? "fail" : ""}`} ref={feedbackSection}>
                        {updateFeedback.success === false && 
                        <p>{updateFeedback.message}</p>
                        }
                    </section>

                    <section className={`feedback ${deleteFeedback.success === false ? "fail" : ""}`} ref={feedbackSection}>
                        {deleteFeedback.success === false && 
                        <p>{deleteFeedback.message}</p>
                        }
                    </section>
                </section>
                
            </section>
            )}
        </section>
    );
}