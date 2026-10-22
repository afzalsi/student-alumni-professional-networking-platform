import api from './api';

export const alumniApi = {
  getDirectory: (params) => api.get('/alumni', { params }),
  getById: (id) => api.get(`/alumni/${id}`),
  getDashboard: () => api.get('/alumni/dashboard')
};
