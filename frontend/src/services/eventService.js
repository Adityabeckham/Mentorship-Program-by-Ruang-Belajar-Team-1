import apiService from './api';

export const eventService = {
  getAllEvents: async (params = {}) => {
    const response = await apiService.get('/events', { params });
    return response.data;
  },

  getEventById: async (id) => {
    const response = await apiService.get('/events/' + id);
    return response.data;
  },

  getManagedEvents: async () => {
    const response = await apiService.get('/events/manage');
    return response.data;
  },

  getEventParticipants: async (id) => {
    const response = await apiService.get(`/events/${id}/participants`);
    return response.data;
  },

  getAdminEvents: async (status) => {
    const response = await apiService.get('/admin/events', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  verifyEvent: async (id, payload) => {
    const response = await apiService.patch('/admin/events/' + id + '/verify', payload);
    return response.data;
  },

  createEvent: async (payload) => {
    const response = await apiService.post('/panitia/events', payload);
    return response.data;
  },

  updateEvent: async (id, payload) => {
    const response = await apiService.put('/panitia/events/' + id, payload);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await apiService.delete('/events/' + id);
    return response.data;
  },
};

export default eventService;
