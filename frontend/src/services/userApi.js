import api from './api';

export const userApi = {
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadFile: (formData) => api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
