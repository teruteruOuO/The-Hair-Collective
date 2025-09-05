import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import App from "./App.jsx";

const Home = lazy(() => import("./pages/HomePage.jsx")); 
const About = lazy(() => import("./pages/AboutPage.jsx"));   

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,        // layout
        children: [
            { index: true, element: <Home /> },      // "/"
            { path: "about", element: <About /> },   // "/about"
        ],
    },
]);