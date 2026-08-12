import apiService from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await apiService.get('/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await apiService.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
