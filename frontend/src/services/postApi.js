import api from './api';

export const postApi = {
  getFeed: (params) => api.get('/posts/feed', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  getComments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  deleteComment: (id, commentId) => api.delete(`/posts/${id}/comments/${commentId}`),
  toggleSave: (id) => api.post(`/posts/${id}/save`),
  getSavedPosts: () => api.get('/posts/saved'),
  sharePost: (id, data) => api.post(`/posts/${id}/share`, data)
};

export const POST_CATEGORIES = [
  'Qualifications',
  'Certifications',
  'Projects',
  'Internships',
  'Placements',
  'Hackathons',
  'Awards',
  'Achievements',
  'Courses',
  'Career updates',
  'Publications',
  'General',
  'Other'
];

export default postApi;
