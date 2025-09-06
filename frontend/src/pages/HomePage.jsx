import SlideShowComponent from '../components/SlideShowComponent';
import FeaturedStylesComponent from '../components/home/FeaturedStylesComponent';
import ServiceDescriptionComponent from '../components/home/ServiceDescriptionComponent';

export default function HomePage() {
    return (
        <main id="home" className="page">
            <SlideShowComponent title="The Hair Collective" page_name="home"/>
            <FeaturedStylesComponent />
            <ServiceDescriptionComponent />
        </main>
    );
}
