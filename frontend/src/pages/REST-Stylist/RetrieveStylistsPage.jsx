import StylistListComponent from "../../components/REST-Stylist/StylistListComponent";
import { Link } from 'react-router-dom'

export default function RetrieveStylistsPage() {
    return (
        <main id="retrieve-stylist" className="page">
            <h1 className="fade-in-from-left">Stylists</h1>
            <p><Link to="/add-stylist" className="fade-in-from-right">Add Stylist</Link></p>
            <StylistListComponent />
        </main>
    );
}