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
  localStorage.removeItem('refreshToken');
};

// Token refresh queue/state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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

// Interceptor Response: Penanganan global status error (401 Unauthorized / 403 Forbidden)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAuthToken();
        // Redirect to login page to re-authenticate
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      // Use raw axios to avoid interceptor loops
      return axios
        .post(`${API.defaults.baseURL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          const newToken = data.token;
          if (!newToken) throw new Error('No token returned from refresh endpoint');
          setAuthToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          return API(originalRequest);
        })
        .catch((err) => {
          processQueue(err, null);
          clearAuthToken();
          window.location.href = '/login';
          return Promise.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    if (status === 403) {
      // Optional: centralized handling for Forbidden
      // e.g. show a toast or redirect to a 403 page
      // window.location.href = '/403';
    }

    return Promise.reject(error);
  }
);

export default API;
