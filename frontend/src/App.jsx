import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";

export default function App() {
    return (
        <>
            <HeaderComponent />
            <Suspense fallback={<p>Loading…</p>}>
                <Outlet />
            </Suspense>
        </>

    );
}