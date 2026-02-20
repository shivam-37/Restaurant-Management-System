import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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
export const getAnalytics = () => api.get('/orders/analytics');

export const updateProfile = (userData) => api.put('/users/profile', userData);

export const getReservations = () => api.get('/reservations');
export const getMyReservations = () => api.get('/reservations/my');
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, status) => api.put(`/reservations/${id}`, { status });

export const getUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;
