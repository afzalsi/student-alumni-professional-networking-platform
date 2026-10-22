import api from './api';

export const jobApi = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  toggleSaveJob: (id) => api.post(`/jobs/${id}/save`),
  getSavedJobs: () => api.get('/jobs/saved/list'),
  applyForJob: (jobId, data) => api.post(`/jobs/${jobId}/apply`, data),
  getJobApplicants: (jobId) => api.get(`/jobs/${jobId}/applications`),
  getMyApplications: () => api.get('/applications/my'),
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data)
};
