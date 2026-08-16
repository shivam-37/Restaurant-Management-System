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
    const [myRestaurants, setMyRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
        let activeRole = sessionStorage.getItem('activeRole');
        if (!activeRole) {
            if (localStorage.getItem('token_owner')) activeRole = 'owner';
            else if (localStorage.getItem('token_admin')) activeRole = 'admin';
            else if (localStorage.getItem('token_user')) activeRole = 'user';
        }
        const saved = activeRole ? localStorage.getItem(`selectedRestaurant_${activeRole}`) : localStorage.getItem('selectedRestaurant');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const activeRole = sessionStorage.getItem('activeRole') || user?.role;
        if (selectedRestaurant && activeRole) {
            localStorage.setItem(`selectedRestaurant_${activeRole}`, JSON.stringify(selectedRestaurant));
        } else if (activeRole) {
            localStorage.removeItem(`selectedRestaurant_${activeRole}`);
        }
    }, [selectedRestaurant, user]);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                let activeRole = sessionStorage.getItem('activeRole');
                let token = activeRole ? localStorage.getItem(`token_${activeRole}`) : null;
                
                if (!token) {
                    if (localStorage.getItem('token_owner')) { activeRole = 'owner'; token = localStorage.getItem('token_owner'); }
                    else if (localStorage.getItem('token_admin')) { activeRole = 'admin'; token = localStorage.getItem('token_admin'); }
                    else if (localStorage.getItem('token_user')) { activeRole = 'user'; token = localStorage.getItem('token_user'); }
                    else if (localStorage.getItem('token')) { token = localStorage.getItem('token'); }
                }

                if (token) {
                    if (activeRole) sessionStorage.setItem('activeRole', activeRole);
                    const { data } = await getMe();
                    setUser(data);

                    // If owner, fetch all their restaurants
                    if (data.role === 'owner') {
                        try {
                            const { data: myRests } = await getMyRestaurant(); // This now returns an array of restaurants
                            setMyRestaurants(myRests);
                            if (!selectedRestaurant && myRests && myRests.length > 0) {
                                setSelectedRestaurant(myRests[0]);
                            }
                        } catch (err) {
                            console.log("No restaurants found for this owner yet");
                        }
                    }
                }
            } catch (error) {
                console.error("Auth check failed", error);
                if (error.response && error.response.status === 401) {
                    const activeRole = sessionStorage.getItem('activeRole');
                    if (activeRole) {
                        localStorage.removeItem(`token_${activeRole}`);
                        localStorage.removeItem(`selectedRestaurant_${activeRole}`);
                    }
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('activeRole');
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
        const role = data.role;
        localStorage.setItem(`token_${role}`, data.token);
        sessionStorage.setItem('activeRole', role);

        let restaurantToSet = null;

        if (data.role === 'owner') {
            try {
                const { data: myRests } = await getMyRestaurant();
                setMyRestaurants(myRests);
                if (myRests && myRests.length > 0) {
                    restaurantToSet = myRests[0];
                }
            } catch (err) {
                console.log("Owner auth: No restaurants found to auto-select");
            }
        } else if (data.role !== 'admin' && data.restaurant) {
            restaurantToSet = typeof data.restaurant === 'string'
                ? { _id: data.restaurant, name: data.restaurantName || 'My Restaurant' }
                : data.restaurant;
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
        const role = user?.role || sessionStorage.getItem('activeRole');
        if (role) {
            localStorage.removeItem(`token_${role}`);
            localStorage.removeItem(`selectedRestaurant_${role}`);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('selectedRestaurant');
        sessionStorage.removeItem('activeRole');
        setUser(null);
        setSelectedRestaurant(null);
        setMyRestaurants([]);
    }, [user]);

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

    // Fetch my restaurants (for owners)
    const refreshMyRestaurants = useCallback(async () => {
        try {
            const { data } = await getMyRestaurant();
            setMyRestaurants(data);
            return data;
        } catch (e) {
            console.error('Failed to refresh my restaurants', e);
            return [];
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
            myRestaurants,
            refreshRestaurants,
            refreshMyRestaurants,
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
