import apiService from './api';
import { clearAuthToken } from './api';

export const authService = {
  login: async (email, password) => {
    const payload = typeof email === 'object' && email !== null ? email : { email, password };
    const response = await apiService.post('/auth/login', payload);
    // Persist refresh token if backend provides one
    if (response && response.data && response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  register: async (nama, email, password, role) => {
    const payload = typeof nama === 'object' && nama !== null ? nama : { nama, email, password, role };
    const response = await apiService.post('/auth/register', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await apiService.get('/auth/me');
    return response.data;
  },

  logout: () => {
    clearAuthToken();
    // Redirect to login page
    window.location.href = '/login';
  },
};

export default authService;
