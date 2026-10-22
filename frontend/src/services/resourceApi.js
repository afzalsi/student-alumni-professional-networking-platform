import api from './api';

export const resourceApi = {
  getResources: (params) => api.get('/resources', { params }),
  createResource: (data) => api.post('/resources', data),
  bookmarkResource: (id) => api.post(`/resources/${id}/bookmark`)
};
