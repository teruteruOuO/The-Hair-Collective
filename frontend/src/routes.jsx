import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import App from "./App.jsx";

const Home = lazy(() => import("./pages/HomePage.jsx")); 
const OurTeam = lazy(() => import("./pages/OurTeamPage.jsx"));   
const Services = lazy(() => import("./pages/ServicesPage.jsx"));  
const Contact = lazy(() => import("./pages/ContactPage.jsx"));    

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,        // layout
        children: [
            { index: true, element: <Home /> },      // "/"
            { path: "our-team", element: <OurTeam /> },   // "/about"
            { path: "services", element: <Services /> },   // "/services"
            { path: "contact", element: <Contact /> },   // "/contact"
        ],
    },
]);