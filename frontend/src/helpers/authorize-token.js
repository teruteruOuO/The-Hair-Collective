import api from "./api";
import { useAdminStore } from "../stores/admin";

// Determine a user's authority for accessing each webpage before they can continue
export const authorizeToken = async (routeName, requiresAuth) => {
    const { setAdmin } = useAdminStore.getState();  // get functions outside components

    try {
        const body = { 
            name: routeName, 
            requires_authentication: requiresAuth
        }
        const response = await api.post('/api/authentication/verify-token', body);
        console.log(response.data.message);
        console.log("Verify Token Data Information:", response);

        return true;

    } catch (err) {
        const response = err.response;

        // Automatically log out the user if there's an authorization issue (ex: expired token)
        if (response && response.status >= 400 && response.status <= 499) {
            if (response.data.expired) {
                alert(response.data.message);
            }

            console.warn(response.data.message);
            setAdmin(prev => ({ ...prev, logged_in: false }));
        }

        return false;
    }
}