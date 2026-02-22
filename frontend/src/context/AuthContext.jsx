import { createContext, useState, useEffect } from 'react';
import {
    getMe,
    login as apiLogin,
    register as apiRegister,
    forgotPassword as apiForgotPassword,
    resetPassword as apiResetPassword
} from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const { data } = await getMe();
                    setUser(data);
                }
            } catch (error) {
                console.error("Auth check failed", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setUser(null);
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
        setUser(data);
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await apiRegister({ name, email, password, role });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        const { data } = await apiForgotPassword(email);
        return data;
    };

    const resetPassword = async (token, password) => {
        const { data } = await apiResetPassword({ token, password });
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, resetPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export default AuthContext;
