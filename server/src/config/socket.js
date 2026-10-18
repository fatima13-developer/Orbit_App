import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/token.utils.js';
import User from '../models/User.model.js';

let ioInstance = null;

// Map of userId -> Set of socketIds
const onlineUsers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5173'
      ],
      credentials: true
    }
  });

  ioInstance = io;

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('_id username name avatar');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for notifications & direct alerts
    socket.join(`user:${userId}`);

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        user: {
          _id: socket.user._id,
          username: socket.user.username,
          name: socket.user.name
        }
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.user._id
      });
    });

    // On disconnect
    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }
  return ioInstance;
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId.toString()}`).emit(event, data);
  }
};

export const emitToConversation = (conversationId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`conversation:${conversationId.toString()}`).emit(event, data);
  }
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

export const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};
