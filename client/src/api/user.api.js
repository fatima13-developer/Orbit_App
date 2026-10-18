import { api } from './axios.js';

export const getUserProfile = async (username) => {
  const response = await api.get(`/users/profile/${username}`);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const updateAvatar = async (formData) => {
  const response = await api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateCoverPhoto = async (formData) => {
  const response = await api.patch('/users/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.post(`/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.delete(`/users/${userId}/follow`);
  return response.data;
};

export const getFollowers = async (userId, page = 1) => {
  const response = await api.get(`/users/${userId}/followers?page=${page}`);
  return response.data;
};

export const getFollowing = async (userId, page = 1) => {
  const response = await api.get(`/users/${userId}/following?page=${page}`);
  return response.data;
};

export const getSuggestedUsers = async () => {
  const response = await api.get('/users/suggested');
  return response.data;
};

export const searchUsers = async (query, page = 1) => {
  const response = await api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}`);
  return response.data;
};
