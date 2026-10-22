import api from './api';

export const sessionApi = {
  bookSession: (data) => api.post('/sessions', data),
  getSessions: () => api.get('/sessions'),
  updateStatus: (id, data) => api.put(`/sessions/${id}`, data)
};
