import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { emitToConversation, emitToUser } from '../config/socket.js';

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (recipientId === currentUserId.toString()) {
      return next(ApiError.badRequest('You cannot start a conversation with yourself'));
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(ApiError.notFound('Recipient not found'));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 }
    })
      .populate('participants', 'name username avatar bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' }
      });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        unreadCounts: {
          [currentUserId.toString()]: 0,
          [recipientId.toString()]: 0
        }
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name username avatar bio'
      );
    }

    return ApiResponse.success(res, { conversation }, 'Conversation retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name username avatar bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' }
      });

    return ApiResponse.success(res, { conversations }, 'Conversations retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return next(ApiError.notFound('Conversation not found or access denied'));
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name username avatar');

    const total = await Message.countDocuments({ conversation: conversationId });

    // Mark messages as seen by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        seenBy: { $ne: req.user._id }
      },
      {
        $addToSet: { seenBy: req.user._id }
      }
    );

    // Reset unread count for current user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    return ApiResponse.success(
      res,
      {
        messages: messages.reverse(), // chronologically ordered for client chat window
        page,
        totalPages: Math.ceil(total / limit),
        total
      },
      'Messages retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;
    const file = req.file;

    if ((!text || !text.trim()) && !file) {
      return next(ApiError.badRequest('Message must have text or an image'));
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId
    });

    if (!conversation) {
      return next(ApiError.notFound('Conversation not found or access denied'));
    }

    let imageData = { url: '', publicId: '' };
    if (file) {
      const uploadRes = await uploadToCloudinary(file, 'chat');
      imageData = { url: uploadRes.url, publicId: uploadRes.publicId };
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      text: text ? text.trim() : '',
      image: imageData,
      seenBy: [currentUserId]
    });

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== currentUserId.toString()
    );

    // Update conversation lastMessage & unread count
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCounts?.get(recipientId.toString()) || 0;
    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    conversation.unreadCounts.set(recipientId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name username avatar'
    );

    // Real-time emit to conversation room and to recipient's personal room
    emitToConversation(conversationId, 'new_message', populatedMessage);
    if (recipientId) {
      emitToUser(recipientId, 'new_message_alert', {
        conversationId,
        message: populatedMessage
      });
    }

    return ApiResponse.created(res, { message: populatedMessage }, 'Message sent');
  } catch (error) {
    next(error);
  }
};

export const markAsSeen = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId
    });

    if (!conversation) {
      return next(ApiError.notFound('Conversation not found'));
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        seenBy: { $ne: currentUserId }
      },
      {
        $addToSet: { seenBy: currentUserId }
      }
    );

    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    emitToConversation(conversationId, 'messages_seen', {
      conversationId,
      userId: currentUserId
    });

    return ApiResponse.success(res, null, 'Messages marked as seen');
  } catch (error) {
    next(error);
  }
};
