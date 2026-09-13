import apiService from './api';

export const userService = {
  getPanitiaList: async () => {
    const response = await apiService.get('/admin/panitia');
    return response.data;
  },

  createPanitia: async (payload) => {
    const response = await apiService.post('/admin/panitia', payload);
    return response.data;
  },

  updatePanitia: async (id, payload) => {
    const response = await apiService.put('/admin/panitia/' + id, payload);
    return response.data;
  },

  deletePanitia: async (id) => {
    const response = await apiService.delete('/admin/panitia/' + id);
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await apiService.get('/admin/users', { params });
    return response.data;
  },
};

export default userService;
