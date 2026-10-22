import api from './api';

export const messageApi = {
  getConversations: () => api.get('/conversations'),
  getMessages: (conversationId) => api.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, content) => api.post(`/conversations/${conversationId}/messages`, { content })
};
