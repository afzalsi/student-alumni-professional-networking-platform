import api from './api';

export const mentorshipApi = {
  createRequest: (data) => api.post('/mentorship/requests', data),
  getRequests: () => api.get('/mentorship/requests'),
  updateRequestStatus: (id, data) => api.put(`/mentorship/requests/${id}`, data),
  getActiveMentorships: () => api.get('/mentorship'),
  updateMentorship: (id, data) => api.put(`/mentorship/${id}`, data)
};
