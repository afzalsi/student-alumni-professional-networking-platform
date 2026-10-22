import api from './api';

export const studentApi = {
  getDashboard: () => api.get('/student/dashboard')
};
