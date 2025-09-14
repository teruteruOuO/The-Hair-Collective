import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authorizeToken } from "../helpers/authorize-token";

export default function ProtectedRoute({ requiresAuth = true }) {
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		check();

		async function check() {
			const isValid = await authorizeToken(location.pathname, requiresAuth);
			setAuthorized(isValid);
			setLoading(false);
		}

	}, [location.pathname, requiresAuth]);

	if (loading) {
		return <section className="loader"></section>;
	}

	if (!authorized) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
