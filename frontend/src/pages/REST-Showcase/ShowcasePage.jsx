import RetrieveImagesComponent from "../../components/REST-Showcase/RetrieveImagesComponent";

export default function ShowcasePage() {
    
    return (
        <main id="showcase" className="page">
            <h1 className="fade-in-from-left">Showcased Images</h1>

            <RetrieveImagesComponent 
            image_type="slideshow" 
            page_name="home" 
            slide="fade-in-from-right"/>

            <RetrieveImagesComponent 
            image_type="featured" 
            page_name="home"
            slide="fade-in-from-left"/>

            <RetrieveImagesComponent 
            image_type="slideshow" 
            page_name="our-team"
            slide="fade-in-from-right"/>

            <RetrieveImagesComponent 
            image_type="slideshow" 
            page_name="services"
            slide="fade-in-from-left"/>

            <RetrieveImagesComponent 
            image_type="slideshow" 
            page_name="contact"
            slide="fade-in-from-right"/>
        </main>
    );
}