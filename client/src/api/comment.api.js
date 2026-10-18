import { api } from './axios.js';

export const getComments = async (postId, page = 1, limit = 20) => {
  const response = await api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createComment = async (postId, data) => {
  const response = await api.post(`/comments/post/${postId}`, data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};

export const unlikeComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}/like`);
  return response.data;
};
