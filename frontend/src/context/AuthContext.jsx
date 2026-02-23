import { createContext, useState, useEffect, useCallback } from 'react';
import {
    getMe,
    login as apiLogin,
    register as apiRegister,
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

    const login = async (email, password) => {
        const { data } = await apiLogin({ email, password });
        localStorage.setItem('token', data.token);

        let restaurantToSet = null;

        // Auto-select restaurant for non-admins
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
                    console.log("Owner login: No restaurant found to auto-select");
                }
            }
        }

        if (restaurantToSet) setSelectedRestaurant(restaurantToSet);
        setUser(data);
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await apiRegister({ name, email, password, role });
        localStorage.setItem('token', data.token);

        let restaurantToSet = null;

        // Auto-select if role is owner (might have been created in backend?)
        if (data.role === 'owner') {
            try {
                const { data: myRest } = await getMyRestaurant();
                if (myRest) restaurantToSet = myRest;
            } catch (err) {
                // Expected for new owners
            }
        }

        if (restaurantToSet) setSelectedRestaurant(restaurantToSet);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('selectedRestaurant');
        setUser(null);
        setSelectedRestaurant(null);
    };

    const forgotPassword = async (email) => {
        const { data } = await apiForgotPassword(email);
        return data;
    };

    const resetPassword = async (token, password) => {
        const { data } = await apiResetPassword({ token, password });
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

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            register,
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
