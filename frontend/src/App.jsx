import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import FooterComponent from "./components/FooterComponent";

export default function App() {
    return (
        <>
            <HeaderComponent />
            <Suspense fallback={<section className="loader"></section>}>
                <Outlet />
            </Suspense>
            <FooterComponent />
        </>
    );
}