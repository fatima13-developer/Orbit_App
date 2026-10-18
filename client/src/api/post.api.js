import { api } from './axios.js';

export const createPost = async (formData) => {
  const response = await api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getFeed = async (cursor = '', limit = 10) => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}&limit=${limit}` : `?limit=${limit}`;
  const response = await api.get(`/posts/feed${query}`);
  return response.data;
};

export const getExplorePosts = async (cursor = '', limit = 10) => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}&limit=${limit}` : `?limit=${limit}`;
  const response = await api.get(`/posts/explore${query}`);
  return response.data;
};

export const getUserPosts = async (username, cursor = '', limit = 10) => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}&limit=${limit}` : `?limit=${limit}`;
  const response = await api.get(`/posts/user/${username}${query}`);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const updatePost = async (id, data) => {
  const response = await api.patch(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const likePost = async (id) => {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
};

export const unlikePost = async (id) => {
  const response = await api.delete(`/posts/${id}/like`);
  return response.data;
};
