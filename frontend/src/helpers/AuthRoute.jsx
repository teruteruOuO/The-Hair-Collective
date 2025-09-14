import { Navigate, Outlet } from "react-router-dom";
import { useAdminStore } from "../stores/admin";

// Used by login page (IF already logged in, don't enter this page)
export default function AuthRoute() {
    const { admin } = useAdminStore((s) => s);

    // If logged in → send to dashboard
    if (admin?.logged_in) {
        return <Navigate to="/panel" replace />;
    }

    // Otherwise → let them see the page
    return <Outlet />;
}
