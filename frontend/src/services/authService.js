import apiService from './api';

export const authService = {
  login: async (email, password) => {
    const payload = typeof email === 'object' && email !== null ? email : { email, password };
    const response = await apiService.post('/auth/login', payload);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
