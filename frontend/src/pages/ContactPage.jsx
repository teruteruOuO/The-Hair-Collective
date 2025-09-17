import SlideShowComponent from '../components/SlideShowComponent';
import LocationsComponent from '../components/contact/LocationsComponent';
import ReviewsComponent from '../components/contact/ReviewsComponent';
import WriteReviewComponent from '../components/contact/WriteReviewComponent';

export default function HomePage() {
    return (
        <main id="services" className="page">
            <SlideShowComponent title="Contacts" page_name="contact"/>
            <LocationsComponent />
            <ReviewsComponent />
            <WriteReviewComponent />
        </main>
    ); 
}
