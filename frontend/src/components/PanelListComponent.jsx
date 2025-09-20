import { Link } from "react-router-dom"

export default function PanelListComponent() {
    return (
        <section id="panel-list">
            <h1 className="fade-in-from-right">Panel</h1>

            <ul>
                <li><Link to="/locations" className="fade-in-from-left">Showcased Images</Link></li>
                <li><Link to="/locations" className="fade-in-from-right">Stylists</Link></li>
                <li><Link to="/update-services" className="fade-in-from-left">Services</Link></li>
                <li><Link to="/locations" className="fade-in-from-right">Locations</Link></li>
                <li><Link to="/reviews/1" className="fade-in-from-left">Reviews</Link></li>
            </ul>
        </section>
    )
}