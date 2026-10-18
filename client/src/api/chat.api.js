import { api } from './axios.js';

export const getOrCreateConversation = async (recipientId) => {
  const response = await api.post('/conversations', { recipientId });
  return response.data;
};

export const getUserConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getMessages = async (conversationId, page = 1, limit = 30) => {
  const response = await api.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  return response.data;
};

export const sendMessage = async (conversationId, formData) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const markConversationSeen = async (conversationId) => {
  const response = await api.patch(`/conversations/${conversationId}/seen`);
  return response.data;
};
