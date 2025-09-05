import SlideShowComponent from '../components/SlideShowComponent';
import FeaturedStylesComponent from '../components/home/FeaturedStylesComponent';
import ServiceDescriptionComponent from '../components/home/ServiceDescriptionComponent';
import FooterComponent from '../components/FooterComponent';

export default function HomePage() {
    return (
        <main id="home" className="page">
            <SlideShowComponent title="The Hair Collective"/>
            <FeaturedStylesComponent />
            <ServiceDescriptionComponent />
            <FooterComponent />
        </main>
    );
}
