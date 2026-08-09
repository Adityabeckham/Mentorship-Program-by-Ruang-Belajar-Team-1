import apiService from './api';

export const authService = {
  login: async (payload) => {
    const response = await apiService.post('/auth/login', payload);
    return response.data;
  },

  register: async (payload) => {
    const response = await apiService.post('/auth/register', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await apiService.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;
