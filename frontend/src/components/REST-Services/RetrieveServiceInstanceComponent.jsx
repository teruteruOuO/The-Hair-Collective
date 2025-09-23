import { useState, useRef, useEffect } from "react";
import { useServiceStore } from "../../stores/service";
import api from "../../helpers/api";

export default function RetrieveServiceInstanceComponent() {
    const { service, setService } = useServiceStore((s) => s);
    const feedbackSection = useRef(null);
    const serviceInstanceSection = useRef(null);
    const [newService, setNewService] = useState({
        name: '',
        price: 0,
        type_id: 0
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
    function handleUpdateChange(typeId, serviceId, e) {
        // service.types
        const { name, value } = e.target;

        setService(prev => ({
            ...prev,
            types: prev.types.map(type =>
                type.id === typeId
                    ? {
                        ...type,
                        services: type.services.map(service =>
                            service.id === serviceId
                                ? { ...service, [name]: value }  // update only this service
                                : service
                        )
                    }
                    : type
            )
        }));
    }

    // Add service type
    async function addService(e) {
        e.stopPropagation();
        e.preventDefault();

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                name: newService.name,
                price: newService.price,
                type_id: newService.type_id
            }
            const response = await api.post('/api/service', body);
            console.log(response.data.message);
            console.log("Add Service Data Information:", response);
            
            setAddFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1,
                scrollToInstances: true
            }));

        } catch (error) {
            console.error(`An error occured while adding the service`);
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

    // Update service 
    async function updateService(service_instance, e) {
        e.stopPropagation();
        e.preventDefault();

        setUpdateFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentUpdatingId(service_instance.id);   // mark which one is updating

        const answer = window.confirm(`Are you sure you want to update service ${service_instance.name.toUpperCase()}?`);

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
                id: service_instance.id,
                name: service_instance.name,
                price: service_instance.price,
                type_id: service_instance.type_id
            }
            const response = await api.put('/api/service', body);
            console.log(response.data.message);
            console.log("Update Service Data Information:", response);
            
            setUpdateFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1,
                scrollToInstances: true
            }));


        } catch (error) {
            console.error(`An error occured while updating the service`);
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
    async function deleteService(service_instance, e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentDeletingId(service_instance.id);   // mark which one is deleting

        const answer = window.confirm(`Are you sure you want to delete service ${service_instance.name.toUpperCase()}?`);

        if (!answer) {
            setCurrentDeletingId(null);
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const parameters = { id: service_instance.id }
            const response = await api.delete('/api/service', { params: parameters });
            console.log(response.data.message);
            console.log("Delete Service Data Information:", response);
            
            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setService(prev => ({
                ...prev,
                version: prev.version + 1,
                scrollToInstances: true
            }));


        } catch (error) {
            console.error(`An error occured while deleting the service`);
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

    // Allows to scroll to the component after add/update/delete
    useEffect(() => {
        if (service.scrollToInstances && service.version > 0) {
            setTimeout(() => {
                serviceInstanceSection.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
                
                // reset flag so it won’t scroll again
                setService(prev => ({ ...prev, scrollToInstances: false }));
            }, 100);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service.version, service.scrollToInstances]);

    return (
        <section id="service-instance" ref={serviceInstanceSection}>
            <h2 className="fade-in-from-left">Service Instances</h2>

            <section className="add-service-instance">
                <form onSubmit={addService} id="add-service-type-form" className="fade-in-from-right">
                    <ul>
                        <li>
                            <label htmlFor="service-name">Name: </label>
                            <input type="text" name="name" id="service-name" 
                            value={newService.name}
                            onChange={handleAddChange}
                            required
                            />
                        </li>

                        <li>
                            <label htmlFor="price">Price: </label>
                            <input type="number" name="price" id="price" 
                            value={newService.price}
                            onChange={handleAddChange}
                            required
                            min="0"
                            step="0.01"
                            />
                        </li>

                        <li>
                            <label htmlFor="service-type">Type: </label>
                            <select name="type_id" id="service-type"
                            value={newService.type_id} 
                            onChange={handleAddChange} 
                            required>
                                <option value=""></option>
                                {service.types.map(type => (
                                <option value={type.id} key={type.id}>{type.name}</option>
                                ))}
                            </select>
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
            <section className="update-service-instance">
                {service.types.map(type => (
                <section className="service-type-instance" key={type.id}>
                    <h3>{type.name}</h3>

                    {type.services.map((service_instance, index) => (
                    <div key={service_instance.id} className={index % 2 == 0 ? 'fade-in-from-left' : 'fade-in-from-right'}>
                        <ul>
                            <li>
                                <h4>{service_instance.name}</h4>
                            </li>
                            <li>
                                <label htmlFor={`service-name-${service_instance.id}`}>Name: </label>
                                <input type="text" name="name" id={`service-name-${service_instance.id}`}
                                value={service_instance.name}
                                onChange={(e) => handleUpdateChange(type.id, service_instance.id, e)}
                                required
                                />
                            </li>

                            <li>
                                <label htmlFor={`price-${service_instance.id}`}>Price: </label>
                                <input type="number" name="price" id={`price-${service_instance.id}`}
                                value={service_instance.price}
                                onChange={(e) => handleUpdateChange(type.id, service_instance.id, e)}
                                required
                                min="0"
                                step="0.01"
                                />
                            </li>

                            <li>
                                <button type="button"
                                onClick={(e) => updateService(service_instance, e)}
                                disabled={updateFeedback.isLoading && currentUpdatingId === type.id}>
                                    {updateFeedback.isLoading && currentUpdatingId === type.id
                                    ? "Updating..."
                                    : "Update"
                                    }
                                </button>
                                <button type="button"
                                onClick={(e) => deleteService(service_instance, e)}
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
                </section>
                ))}

                <section className="update-service-feedbacks">
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