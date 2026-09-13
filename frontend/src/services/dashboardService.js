import apiService from './api';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await apiService.get('/admin/dashboard/stats');
    return response.data;
  },

  getPanitiaStats: async () => {
    const response = await apiService.get('/panitia/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
