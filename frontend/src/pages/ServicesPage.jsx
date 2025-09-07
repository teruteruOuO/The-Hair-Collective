import SlideShowComponent from '../components/SlideShowComponent';
import ServiceListComponent from '../components/services-folder/ServiceListComponent';

export default function HomePage() {
    return (
        <main id="services" className="page">
            <SlideShowComponent title="Services" page_name="services"/>
            <ServiceListComponent />
        </main>
    );
}
