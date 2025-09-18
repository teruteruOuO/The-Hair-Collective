import AllLocationsComponent from "../../components/REST-Location/AllLocationsComponent";
import { Link } from "react-router-dom"


export default function RetrieveLocationsPage() {
    return (
        <main id="retrieve-locations" className="page">
            <h1>Locations</h1>

            <p className="fade-in-from-right"><Link to="/new-location">Add Location</Link></p>

            <AllLocationsComponent />
        </main>
    );
}