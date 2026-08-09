import apiService from './api';

export const registrationService = {
  registerForEvent: async (eventId, payload = {}) => {
    const response = await apiService.post(`/registrations/${eventId}`, payload);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await apiService.get('/registrations/me');
    return response.data;
  },
};

export default registrationService;
