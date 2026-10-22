import api from './api';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  verifyAlumni: (id, isVerified) => api.put(`/admin/alumni/${id}/verify`, { isVerified }),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJobApproval: (id, status) => api.put(`/admin/jobs/${id}/approve`, { status }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getReports: (params) => api.get('/reports', { params }),
  submitReport: (data) => api.post('/reports', data),
  resolveReport: (id, data) => api.put(`/reports/${id}/resolve`, data)
};
