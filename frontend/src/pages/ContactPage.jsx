import SlideShowComponent from '../components/SlideShowComponent';
import LocationsComponent from '../components/contact/LocationsComponent';

export default function HomePage() {
    return (
        <main id="services" className="page">
            <SlideShowComponent title="Contacts" page_name="contact"/>
            <LocationsComponent />
        </main>
    ); 
}
