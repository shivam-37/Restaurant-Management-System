import { createContext, useState, useEffect, useCallback } from 'react';
import {
    getMe,
    login as apiLogin,
    register as apiRegister,
    verifyOtp,
    sendOtp as apiSendOtp,
    googleAuth,
    forgotPassword as apiForgotPassword,
    resetPassword as apiResetPassword,
    getMyRestaurant,
    getRestaurants
} from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
        const saved = localStorage.getItem('selectedRestaurant');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        if (selectedRestaurant) {
            localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
        } else {
            localStorage.removeItem('selectedRestaurant');
        }
    }, [selectedRestaurant]);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const { data } = await getMe();
                    setUser(data);

                    // If owner, ensure they have a selected restaurant
                    if (data.role === 'owner' && !selectedRestaurant) {
                        if (data.restaurant) {
                            const restaurantObj = typeof data.restaurant === 'string'
                                ? { _id: data.restaurant, name: 'My Restaurant' }
                                : data.restaurant;
                            setSelectedRestaurant(restaurantObj);
                        } else if (data.role === 'owner') {
                            // Fallback for owners: try to fetch by owner ID from server
                            try {
                                const { data: myRest } = await getMyRestaurant();
                                if (myRest) setSelectedRestaurant(myRest);
                            } catch (err) {
                                console.log("No restaurant found for this owner yet");
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Auth check failed", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setUser(null);
                    setSelectedRestaurant(null);
                }
            } finally {
                setLoading(false);
            }
        };
        checkUserLoggedIn();
    }, []);

    const handleAuthSuccess = async (data) => {
        localStorage.setItem('token', data.token);

        let restaurantToSet = null;

        if (data.role !== 'admin') {
            if (data.restaurant) {
                restaurantToSet = typeof data.restaurant === 'string'
                    ? { _id: data.restaurant, name: data.restaurantName || 'My Restaurant' }
                    : data.restaurant;
            } else if (data.role === 'owner') {
                try {
                    const { data: myRest } = await getMyRestaurant();
                    if (myRest) restaurantToSet = myRest;
                } catch (err) {
                    console.log("Owner auth: No restaurant found to auto-select");
                }
            }
        }

        if (restaurantToSet) setSelectedRestaurant(restaurantToSet);
        setUser(data);
        return data;
    };

    const login = async (identifier, password) => {
        const { data } = await apiLogin({ identifier, password });
        if (data.requiresOtp) {
            return data;
        }
        return await handleAuthSuccess(data);
    };

    const register = async (name, email, phone, password, role) => {
        const { data } = await apiRegister({ name, email, phone, password, role });
        
        if (data.requiresOtp) {
            return data;
        }

        return await handleAuthSuccess(data);
    };

    const verifyUserOtp = async (payload) => {
        // payload = { email, phone, otp }
        const { data } = await verifyOtp(payload);
        return await handleAuthSuccess(data);
    };

    const sendOtp = async (payload) => {
        const { data } = await apiSendOtp(payload);
        return data;
    };

    const loginWithGoogle = async (token, role) => {
        const { data } = await googleAuth({ token, role });
        return await handleAuthSuccess(data);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('selectedRestaurant');
        setUser(null);
        setSelectedRestaurant(null);
    }, []);

    const forgotPassword = async (payload) => {
        const { data } = await apiForgotPassword(payload);
        return data;
    };

    const resetPassword = async (payload, maybePassword) => {
        const { data } = await apiResetPassword(payload, maybePassword);
        return data;
    };

    // Fetch all restaurants and cache in context
    const refreshRestaurants = useCallback(async () => {
        try {
            const { data } = await getRestaurants();
            setRestaurants(data);
        } catch (e) {
            console.error('Failed to refresh restaurants', e);
        }
    }, []);

    // Update a single restaurant in the cached list (e.g. after settings save)
    const updateRestaurantInList = useCallback((updatedRestaurant) => {
        setRestaurants(prev =>
            prev.map(r => r._id === updatedRestaurant._id ? updatedRestaurant : r)
        );
        // Also keep selectedRestaurant in sync
        setSelectedRestaurant(prev =>
            prev?._id === updatedRestaurant._id ? updatedRestaurant : prev
        );
    }, []);

    // Auto-logout on 10 min inactivity or back button press
    useEffect(() => {
        if (!user) return;

        let timeoutId;

        const handleActivity = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                logout();
                alert('You have been automatically logged out due to 10 minutes of inactivity.');
            }, 10 * 60 * 1000); // 10 minutes
        };

        const handlePopState = () => {
            logout();
        };

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        // Listeners for inactivity
        activityEvents.forEach(event => window.addEventListener(event, handleActivity));
        // Listener for back button
        window.addEventListener('popstate', handlePopState);

        // Start the timer immediately
        handleActivity();

        return () => {
            clearTimeout(timeoutId);
            activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
            window.removeEventListener('popstate', handlePopState);
        };
    }, [user, logout]);

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            register,
            verifyUserOtp,
            sendOtp,
            loginWithGoogle,
            logout,
            forgotPassword,
            resetPassword,
            loading,
            restaurants,
            setRestaurants,
            refreshRestaurants,
            updateRestaurantInList,
            selectedRestaurant,
            setSelectedRestaurant
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export default AuthContext;
