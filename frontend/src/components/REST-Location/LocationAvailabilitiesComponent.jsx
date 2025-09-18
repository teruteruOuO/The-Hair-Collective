import days from '../../helpers/days';
import { useLocationStore } from '../../stores/location';
import { useState, useRef } from 'react';
import api from '../../helpers/api';

export default function LocationAvailabilitiesComponent() {
    const { location, setLocation } = useLocationStore((s) => s);
    const feedbackSection = useRef(null);
    const [newDay, setNewDay] = useState({
        day: '',
        start: '',
        end: ''
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

    // Form inputs
    function handleAddChange(e) {
        const { name, value } = e.target;
        setNewDay(prev => ({ ...prev, [name]: value }));
    }

    // Form inputs for update
    function handleUpdateChange(id, e) {
        const { name, value } = e.target;

        setLocation(prev => ({
            ...prev,
            availabilities: prev.availabilities.map(a =>
                a.id === id ? { ...a, [name]: value } : a
            )
        }));
    }

    // Add day
    async function addDay(e) {
        e.stopPropagation();
        e.preventDefault();

        setAddFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const body = {
                location_id: location.id,
                day: newDay.day,
                start: newDay.start,
                end: newDay.end,
            }
            const response = await api.post('/api/location/opening-hour', body);
            console.log(response.data.message);
            console.log("Add Opening Hour Data Information:", response);
            
            setAddFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setLocation(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while adding the opening day`);
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

    // Update day
    async function updateDay(day, e) {
        e.stopPropagation();
        e.preventDefault();

        setUpdateFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentUpdatingId(day.id);   // mark which one is updating

        const answer = window.confirm("Are you sure you want to update this opening day?");

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
                id: day.id,
                day: day.day,
                start: day.start,
                end: day.end,
            }
            const response = await api.put('/api/location/opening-hour', body);
            console.log(response.data.message);
            console.log("Updating Opening Hour Data Information:", response);
            
            setUpdateFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setLocation(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while updating the opening day`);
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

    // Delete day
    async function deleteDay(day, e) {
        e.stopPropagation();
        e.preventDefault();

        setDeleteFeedback({
            isLoading: false,
            message: '',
            success: null
        });
        setCurrentDeletingId(day.id);   // mark which one is deleting

        const answer = window.confirm("Are you sure you want to delete this opening day?");

        if (!answer) {
            setCurrentDeletingId(null);
            return;
        }

        setDeleteFeedback(prev => ({
            ...prev,
            isLoading: true
        }));

        try {
            const parameters = { id: day.id }
            const response = await api.delete('/api/location/opening-hour', { params: parameters });
            console.log(response.data.message);
            console.log("Deleting Opening Hour Data Information:", response);
            
            setDeleteFeedback(prev => ({
                ...prev,
                message: response.data.message,
                success: true
            }));

            window.alert(response.data.message);

            // Trigger useState of this component's parent to refresh
            setLocation(prev => ({
                ...prev,
                version: prev.version + 1
            }));


        } catch (error) {
            console.error(`An error occured while deleting the opening day`);
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

            setCurrentDeletingId(prev => ({
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
        <section id="location-availabilities">
            <h1>Availabilities</h1>

            <section className='add-opening-day fade-in-from-right'>
                <form onSubmit={addDay} id="add-opening-day-form">
                    <ul>
                        <li>
                            <label htmlFor="day">Day: </label>
                            <select name="day" id="day" value={newDay.day} onChange={handleAddChange} placeholder="New Location" required>
                                <option value=""></option>
                                {days.map(day => (
                                <option value={day} key={day}>{day}</option>
                                ))}
                            </select>
                        </li>
                        <li>
                            <label htmlFor="start">Start Hour: </label>
                            <input type="time" name="start" id="start" value={newDay.start} onChange={handleAddChange} required />
                        </li>
                        <li>
                            <label htmlFor="end">End Hour: </label>
                            <input type="time" name="end" id="end" value={newDay.end} onChange={handleAddChange} required />
                        </li>
                        <li>
                            <button type="submit" disabled={addFeedback.isLoading}>
                                {addFeedback.isLoading ? 'Adding...' : 'Add'}
                            </button>
                        </li>
                    </ul>
                </form>

                <section className={`feedback ${addFeedback.success === false ? "fail" : ""}`} ref={feedbackSection}>
                    {addFeedback.success === false && 
                    <p>{addFeedback.message}</p>
                    }
                </section>
            </section>

            {location.availabilities.length >= 1 && (
            <section className='update-opening-day fade-in-from-left'>
                {location.availabilities.map((availability, index) => (
                <div id={`update-opening-day-form-${availability.id}`} key={availability.id}>
                    <ul>
                        <li>
                            <h3>Opening Hour #{index + 1}</h3>
                        </li>
                        <li className={index % 2 == 0 ? 'fade-in-from-right' : 'fade-in-from-left'}>
                            <label htmlFor={`day-${availability.id}`}>Day: </label>
                            <select name="day" id={`day-${availability.id}`} value={availability.day} onChange={(e) => handleUpdateChange(availability.id, e)} required>
                                <option value=""></option>
                                {days.map(day => (
                                    <option value={day} key={day}>{day}</option>
                                ))}
                            </select>
                        </li>
                        <li>
                            <label htmlFor={`start-${availability.id}`}>Start Hour: </label>
                            <input type="time" name="start" id={`start-${availability.id}`} value={availability.start} onChange={(e) => handleUpdateChange(availability.id, e)} required />
                        </li>
                        <li>
                            <label htmlFor={`end-${availability.id}`}>End Hour: </label>
                            <input type="time" name="end" id={`end-${availability.id}`} value={availability.end} onChange={(e) => handleUpdateChange(availability.id, e)} required />
                        </li>
                        <li>
                            <button type="button" onClick={(e) => updateDay(availability, e)} disabled={updateFeedback.isLoading && currentUpdatingId === availability.id}>
                                {updateFeedback.isLoading && currentUpdatingId === availability.id
                                ? "Updating..."
                                : "Update"
                                }
                            </button>
                            <button type="button" onClick={(e) => deleteDay(availability, e)} disabled={deleteFeedback.isLoading && currentDeletingId === availability.id}>
                                {deleteFeedback.isLoading && currentDeletingId === availability.id
                                ? "Deleting..."
                                : "Delete"
                                }
                            </button>
                        </li>
                    </ul>
                </div>
                ))}

                <section className={`feedback ${deleteFeedback.success === false ? "fail" : ""}`} ref={feedbackSection}>
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
            )}

            
        </section>
    );
}