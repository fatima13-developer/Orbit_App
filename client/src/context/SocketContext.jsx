import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { getAccessToken } from '../api/axios.js';
import { getUnreadNotificationCount } from '../api/notification.api.js';
import { useToast } from './ToastContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (isAuthenticated) {
      getUnreadNotificationCount()
        .then((res) => {
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Connect / disconnect socket
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = getAccessToken();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      // Socket connected
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Real-time notifications
    newSocket.on('new_notification', (notification) => {
      setUnreadCount((prev) => prev + 1);

      let actionDesc = 'interacted with your profile';
      if (notification.type === 'like') actionDesc = 'liked your post';
      if (notification.type === 'comment') actionDesc = 'commented on your post';
      if (notification.type === 'reply') actionDesc = 'replied to your comment';
      if (notification.type === 'follow') actionDesc = 'started following you';

      showToast(`${notification.sender?.name || 'Someone'} ${actionDesc}!`, 'info');
    });

    // Real-time direct message alert
    newSocket.on('new_message_alert', ({ message }) => {
      // Only show toast if user isn't on the chat page or active conversation
      if (!window.location.pathname.includes('/messages')) {
        showToast(`💬 New message from ${message.sender?.name || 'user'}`, 'info');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const clearUnreadNotifications = () => {
    setUnreadCount(0);
  };

  const decrementNotificationCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadCount,
        clearUnreadNotifications,
        decrementNotificationCount,
        isUserOnline: (userId) => onlineUsers.includes(userId?.toString())
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
