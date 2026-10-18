import Notification from '../models/Notification.model.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name username avatar')
      .populate('post', 'content images')
      .populate('comment', 'content');

    const total = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    return ApiResponse.success(
      res,
      {
        notifications,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit),
        total
      },
      'Notifications retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    return ApiResponse.success(res, { unreadCount }, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
      return ApiResponse.success(res, null, 'All notifications marked as read');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(ApiError.notFound('Notification not found'));
    }

    return ApiResponse.success(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return next(ApiError.notFound('Notification not found'));
    }

    return ApiResponse.success(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
