import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Ideally verify token with backend here
                    // For now, decode or trust if valid format
                    // setUser({ token }); 
                    // Better: Fetch user data
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                    const { data } = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/me`, config);
                    setUser(data);
                }
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/login`, { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await axios.post(`${window.location.protocol}//${window.location.hostname}:5000/api/auth/register`, { name, email, password, role });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
