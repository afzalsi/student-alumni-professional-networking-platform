import api from './api';

export const reviewApi = {
  createReview: (data) => api.post('/reviews', data),
  getMentorReviews: (alumniId) => api.get(`/alumni/${alumniId}/reviews`)
};
