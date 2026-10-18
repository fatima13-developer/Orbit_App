import User from '../models/User.model.js';
import Follow from '../models/Follow.model.js';
import Notification from '../models/Notification.model.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { emitToUser } from '../config/socket.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    let isFollowing = false;
    let isSelf = false;

    if (req.user) {
      isSelf = req.user._id.toString() === user._id.toString();
      if (!isSelf) {
        const followDoc = await Follow.findOne({
          follower: req.user._id,
          following: user._id
        });
        isFollowing = Boolean(followDoc);
      }
    }

    return ApiResponse.success(
      res,
      {
        user,
        isFollowing,
        isSelf
      },
      'User profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, website } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('No image file provided'));
    }

    const user = await User.findById(req.user._id);
    const oldPublicId = user.avatar?.publicId;

    const uploaded = await uploadToCloudinary(req.file, 'avatars');

    user.avatar = {
      url: uploaded.url,
      publicId: uploaded.publicId
    };
    await user.save();

    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId).catch((err) =>
        console.warn('Failed to delete old avatar:', err.message)
      );
    }

    return ApiResponse.success(res, { avatar: user.avatar }, 'Avatar updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('No image file provided'));
    }

    const user = await User.findById(req.user._id);
    const oldPublicId = user.coverPhoto?.publicId;

    const uploaded = await uploadToCloudinary(req.file, 'covers');

    user.coverPhoto = {
      url: uploaded.url,
      publicId: uploaded.publicId
    };
    await user.save();

    if (oldPublicId) {
      deleteFromCloudinary(oldPublicId).catch((err) =>
        console.warn('Failed to delete old cover photo:', err.message)
      );
    }

    return ApiResponse.success(res, { coverPhoto: user.coverPhoto }, 'Cover photo updated successfully');
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return next(ApiError.badRequest('You cannot follow yourself'));
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return next(ApiError.notFound('User not found'));
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (existingFollow) {
      return ApiResponse.success(res, { isFollowing: true }, 'Already following this user');
    }

    await Follow.create({
      follower: currentUserId,
      following: targetUserId
    });

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

    // Create & emit real-time notification
    const notification = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow'
    });

    const populatedNotif = await Notification.findById(notification._id).populate(
      'sender',
      'name username avatar'
    );

    emitToUser(targetUserId, 'new_notification', populatedNotif);

    return ApiResponse.success(res, { isFollowing: true }, 'Followed user successfully');
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const followDoc = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId
    });

    if (followDoc) {
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
    }

    return ApiResponse.success(res, { isFollowing: false }, 'Unfollowed user successfully');
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const follows = await Follow.find({ following: id })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('follower', 'name username avatar bio')
      .sort({ createdAt: -1 });

    const currentUserId = req.user ? req.user._id : null;
    let myFollowingSet = new Set();

    if (currentUserId) {
      const myFollowings = await Follow.find({ follower: currentUserId }).select('following');
      myFollowingSet = new Set(myFollowings.map((f) => f.following.toString()));
    }

    const followers = follows
      .filter((f) => f.follower)
      .map((f) => ({
        ...f.follower.toObject(),
        isFollowing: myFollowingSet.has(f.follower._id.toString())
      }));

    return ApiResponse.success(res, { followers, page }, 'Followers retrieved');
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const follows = await Follow.find({ follower: id })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('following', 'name username avatar bio')
      .sort({ createdAt: -1 });

    const currentUserId = req.user ? req.user._id : null;
    let myFollowingSet = new Set();

    if (currentUserId) {
      const myFollowings = await Follow.find({ follower: currentUserId }).select('following');
      myFollowingSet = new Set(myFollowings.map((f) => f.following.toString()));
    }

    const following = follows
      .filter((f) => f.following)
      .map((f) => ({
        ...f.following.toObject(),
        isFollowing: myFollowingSet.has(f.following._id.toString())
      }));

    return ApiResponse.success(res, { following, page }, 'Following list retrieved');
  } catch (error) {
    next(error);
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    let excludeIds = [];

    if (currentUserId) {
      excludeIds.push(currentUserId);
      const myFollowings = await Follow.find({ follower: currentUserId }).select('following');
      excludeIds.push(...myFollowings.map((f) => f.following));
    }

    const suggested = await User.find({ _id: { $nin: excludeIds } })
      .select('name username avatar bio followersCount')
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(6);

    return ApiResponse.success(res, { suggested }, 'Suggested users retrieved');
  } catch (error) {
    next(error);
  }
};
