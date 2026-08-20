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

// A shared promise makes concurrent expired-token requests wait for one refresh.
let refreshPromise = null;

const refreshAccessToken = (refreshToken) => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API.defaults.baseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        if (!data.token) throw new Error('No token returned from refresh endpoint');
        setAuthToken(data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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

// Interceptor Response: refresh only authentication failures, not role-based 403 responses.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || '';
    const isExpiredToken = status === 403 && /token.*(tidak valid|kadaluarsa|kedaluwarsa)/i.test(message);

    if ((status === 401 || isExpiredToken) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAuthToken();
        // Redirect to login page to re-authenticate
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return refreshAccessToken(refreshToken)
        .then((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        })
        .catch((err) => {
          clearAuthToken();
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default API;
