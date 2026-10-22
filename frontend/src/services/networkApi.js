import api from './api';

export const networkApi = {
  // Follow System
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id, params) => api.get(`/users/${id}/followers`, { params }),
  getFollowing: (id, params) => api.get(`/users/${id}/following`, { params }),
  getNetworkStatus: (id) => api.get(`/users/${id}/network-status`),
  getUserNetworkCounts: (id) => api.get(`/users/${id}/network-status`),

  // Connection System
  sendConnectionRequest: (id) => api.post(`/connections/${id}/request`),
  acceptConnectionRequest: (id) => api.post(`/connections/${id}/accept`),
  acceptConnection: (id) => api.post(`/connections/${id}/accept`),
  rejectConnectionRequest: (id) => api.post(`/connections/${id}/reject`),
  rejectConnection: (id) => api.post(`/connections/${id}/reject`),
  removeConnection: (id) => api.delete(`/connections/${id}`),
  getConnections: (params) => api.get('/connections', { params }),
  getConnectionRequests: () => api.get('/connections/requests'),
  getReceivedRequests: async () => {
    const res = await api.get('/connections/requests');
    return { ...res, data: res.data?.received || [] };
  },
  getSentRequests: async () => {
    const res = await api.get('/connections/requests');
    return { ...res, data: res.data?.sent || [] };
  },
  getSuggestions: (params) => api.get('/connections/suggestions', { params }),

  // Search & Discover
  search: (q, type) => api.get('/search', { params: { q, type } }),
  searchAll: (params) => api.get('/search', { params })
};

export default networkApi;
