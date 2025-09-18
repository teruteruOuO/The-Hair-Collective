import SlideShowComponent from '../components/SlideShowComponent';
import ServiceListComponent from '../components/services-folder/ServiceListComponent';
import ReviewsComponent from '../components/contact/ReviewsComponent';
import WriteReviewComponent from '../components/contact/WriteReviewComponent';

export default function HomePage() {
    return (
        <main id="services" className="page">
            <SlideShowComponent title="Services" page_name="services"/>
            <ServiceListComponent />
            <ReviewsComponent />
            <WriteReviewComponent />
        </main>
    );
}
