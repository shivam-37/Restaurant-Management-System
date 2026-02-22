import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5001/api',
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getMenu = () => api.get('/menu');
export const createMenuItem = (item) => api.post('/menu', item);
export const updateMenuItem = (id, item) => api.put(`/menu/${id}`, item);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

export const getOrders = () => api.get('/orders');
export const createOrder = (order) => api.post('/orders', order);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}`, { status });
export const addOrderReview = (id, reviewData) => api.put(`/orders/${id}/review`, reviewData);
export const getAnalytics = () => api.get('/orders/analytics');

export const updateProfile = (userData) => api.put('/users/profile', userData);

// Reservation APIs
export const getReservations = () => api.get('/reservations');
export const getMyReservations = () => api.get('/reservations/my');
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, status) => api.put(`/reservations/${id}`, { status });

// AI APIs
export const generateDescription = (data) => api.post('/ai/generate-description', data);
export const generateOrderInstructions = (data) => api.post('/ai/generate-instructions', data);
export const getRecommendations = () => api.post('/ai/recommendations');
export const predictInventory = () => api.post('/ai/predict-inventory');

// Notification APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Restaurant APIs
export const getRestaurant = () => api.get('/restaurant');
export const updateTableStatus = (number, status) => api.put(`/restaurant/table/${number}`, { status });

export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getMe = () => api.get('/auth/me');

export default api;
