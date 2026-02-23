import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
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

export const getMenu = (restaurantId) => api.get(`/menu${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);
export const createMenuItem = (item) => api.post('/menu', item);
export const updateMenuItem = (id, item) => api.put(`/menu/${id}`, item);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

export const getOrders = (restaurantId) => api.get(`/orders${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);
export const createOrder = (order) => api.post('/orders', order);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}`, { status });
export const addOrderReview = (id, reviewData) => api.put(`/orders/${id}/review`, reviewData);
export const getAnalytics = (restaurantId) => api.get(`/orders/analytics${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);

export const updateProfile = (userData) => api.put('/users/profile', userData);

// Reservation APIs
export const getReservations = (restaurantId) => api.get(`/reservations${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);
export const getMyReservations = (restaurantId) => api.get(`/reservations/my${restaurantId ? `?restaurantId=${restaurantId}` : ''}`);
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, status) => api.put(`/reservations/${id}`, { status });

// AI APIs
export const generateDescription = (data) => api.post('/ai/generate-description', data);
export const generateOrderInstructions = (data) => api.post('/ai/generate-instructions', data);
export const getRecommendations = (restaurantId) => api.post('/ai/recommendations', { restaurantId });
export const predictInventory = (restaurantId) => api.post('/ai/predict-inventory', { restaurantId });

// Notification APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Restaurant APIs
export const getRestaurants = () => api.get('/restaurant');
export const getRestaurantDetails = (id) => api.get(`/restaurant/${id}`);
export const getMyRestaurant = () => api.get('/restaurant/my');
export const createRestaurant = (data) => api.post('/restaurant', data);
export const updateRestaurant = (id, data) => api.put(`/restaurant/${id}`, data);
export const updateTableStatus = (id, number, status) => api.put(`/restaurant/${id}/table/${number}`, { status });

export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getMe = () => api.get('/auth/me');

export default api;
