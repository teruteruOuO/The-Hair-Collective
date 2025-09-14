import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import App from "./App.jsx";
import ProtectedRoute from "./helpers/ProtectedRoute.jsx";
import AuthRoute from "./helpers/AuthRoute.jsx";

const Home = lazy(() => import("./pages/HomePage.jsx")); 
const OurTeam = lazy(() => import("./pages/OurTeamPage.jsx"));   
const Services = lazy(() => import("./pages/ServicesPage.jsx"));  
const Contact = lazy(() => import("./pages/ContactPage.jsx"));    
const NotFound = lazy(() => import("./pages/NotFoundPage.jsx")); 
const Login = lazy(() => import("./pages/LoginPage.jsx")); 
const Panel = lazy(() => import("./pages/PanelPage.jsx")); 
const Dashboard = lazy(() => import("./pages/DashboardPage.jsx")); 

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
                element: <AuthRoute />,  // automatically calls authorizeToken
                children: [
                    { path: "login", element: <Login /> },   // "/login"
                ],
            },

            // Group of protected routes
            {
                element: <ProtectedRoute />,  // automatically calls authorizeToken
                children: [
                    { path: "panel", element: <Panel /> },          // panel
                    { path: "dashboard", element: <Dashboard /> },  // dashboard
                ],
            },


            { path: "*", element: <NotFound /> },         // catch-all route
        ],
    },
]);