
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ServiceDescriptionComponent() {
    const [services, setServices] = useState([]);
    const [pageFeedback, setPageFeedBack] = useState({
        isLoading: false,
        message: '',
        success: false
    });

    useEffect(() => {
        retrieveServices();

        // Retrieve image function
        async function retrieveServices() {
            setPageFeedBack(prev => ({
                ...prev,
                isLoading: true
            }));

            try {
                console.log('Retrieving services');
                const serviceResponse = [
                    {
                        id: 1,
                        name: "Service 1",
                        description: "Brief description about this service is told."
                    },
                    {
                        id: 2,
                        name: "Service 2",
                        description: "Brief description about this service is told."
                    },
                    {
                        id: 3,
                        name: "Service 3",
                        description: "Brief description about this service is told."
                    },
                    {
                        id: 4,
                        name: "Service 4",
                        description: "Brief description about this service is told."
                    },
                ]

                setServices(serviceResponse);
                setPageFeedBack(prev => ({
                    ...prev,
                    message: "Successfully retrieved services",
                    success: true
                }));
                console.log("Successfully retrieved services");

            } catch (error) {
                console.error(`An error occured while retrieving services`);
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
        <section id="service-description">
            {pageFeedback.isLoading && (
                <section className="loader">
                </section>
            )}

            {(!pageFeedback.success) && (
                <section className="feedback fail">
                    Error Retrieval
                </section>
            )}

            {(services.length <= 0) && (
                <section className="feedback fail">
                    Please add at least one service
                </section>
            )}

            {(services.length > 0) && (
                <section className="featured">
                    <ul>
                    {services.map(service => (
                        <li key={service.id}>
                            <Link to={`/about/#${service.name}`}>
                                <span>{service.name}</span>
                                <span>{service.description}</span>
                            </Link>
                        </li>
                    ))}
                    </ul>
                </section>
            )}  
        </section>
    );
}