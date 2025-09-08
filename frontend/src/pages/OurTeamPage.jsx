import SlideShowComponent from '../components/SlideShowComponent';
import AllStylistComponent from '../components/our-team/AllStylistComponent';

export default function AboutPage() {

    return (
        <main id="our-team" className="page">
            <SlideShowComponent title="Our Team" page_name="our-team"/>
            <AllStylistComponent />
        </main>
    );
}
