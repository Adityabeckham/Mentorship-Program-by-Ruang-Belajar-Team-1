import axios from 'axios';

// Base Axios Instance terpusat untuk seluruh HTTP Requests
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions untuk manajemen Token Authorization Header
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const clearAuthToken = () => {
  delete API.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Interceptor Request: Otomatis menyuntikkan JWT Token dari localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Penanganan global status error (401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export default API;
