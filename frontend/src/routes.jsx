import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import App from "./App.jsx";
import ProtectedRoute from "./helpers/ProtectedRoute.jsx";
import AuthRoute from "./helpers/AuthRoute.jsx";
import { Navigate } from "react-router-dom";

const Home = lazy(() => import("./pages/HomePage.jsx")); 
const OurTeam = lazy(() => import("./pages/OurTeamPage.jsx"));   
const Services = lazy(() => import("./pages/ServicesPage.jsx"));  
const Contact = lazy(() => import("./pages/ContactPage.jsx"));    
const NotFound = lazy(() => import("./pages/NotFoundPage.jsx")); 
const Login = lazy(() => import("./pages/LoginPage.jsx")); 
const Panel = lazy(() => import("./pages/PanelPage.jsx")); 
const RetrieveLocations = lazy(() => import("./pages/REST-Location/RetrieveLocationsPage.jsx")); 
const NewLocation = lazy(() => import("./pages/REST-Location/NewLocationPage.jsx")); 
const RetrieveServices = lazy(() => import("./pages/REST-Services/RetrieveServicesPage.jsx"));
const UpdateLocation = lazy(() => import("./pages/REST-Location/UpdateLocationPage.jsx"));
const RetrieveStylist = lazy(() => import("./pages/REST-Stylist/RetrieveStylistsPage.jsx"));
const AddStylist = lazy(() => import("./pages/REST-Stylist/AddStylistPage.jsx"));
const StylistInstance = lazy(() => import("./pages/REST-Stylist/StylistInstancePage.jsx"));
const Showcase = lazy(() => import("./pages/REST-Showcase/ShowcasePage.jsx"));
const Reviews = lazy(() => import("./pages/ReviewsPage.jsx"));


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,        // layout
        children: [
            { index: true, element: <Home /> },      // "/"
            { path: "our-team", element: <OurTeam /> },   // "/about"
            { path: "services", element: <Services /> },   // "/services"
            { path: "contact", element: <Contact /> },   // "/contact"

            // Blocked pages if logged in
            {
                element: <AuthRoute />,  
                children: [
                    { path: "login", element: <Login /> },   // "/login"
                ],
            },

            // Group of protected routes
            {
                element: <ProtectedRoute />,  // automatically calls authorizeToken
                children: [
                    { path: "panel", element: <Panel /> },          // panel
                    { path: "locations", element: <RetrieveLocations /> },  // locations
                    { path: "new-location", element: <NewLocation /> },  // new-location
                    { path: "location/:id", element: <UpdateLocation /> },  // specific location

                    { path: "update-services", element: <RetrieveServices /> },  // admin-side services

                    { path: "reviews", element: <Navigate to="/reviews/1" /> }, // reviews default
                    { path: "reviews/:page", element: <Reviews /> },  // reviews

                    { path: "stylists", element: <RetrieveStylist /> },  // stylists
                    { path: "add-stylist", element: <AddStylist /> },  // add-stylist
                    { path: "stylist/:id", element: <StylistInstance /> },  // update stylist

                    { path: "showcase", element: <Showcase /> },  // reviews
                ],
            },


            { path: "*", element: <NotFound /> },         // catch-all route
        ],
    },
]);