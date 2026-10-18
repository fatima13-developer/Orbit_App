import User from '../models/User.model.js';
import Follow from '../models/Follow.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    if (!q || !q.trim()) {
      return ApiResponse.success(res, { users: [], total: 0 }, 'Empty query');
    }

    const searchQuery = q.trim();
    const regex = new RegExp(searchQuery, 'i');

    const users = await User.find({
      $or: [{ username: regex }, { name: regex }]
    })
      .select('name username avatar bio followersCount')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({
      $or: [{ username: regex }, { name: regex }]
    });

    const currentUserId = req.user ? req.user._id : null;
    let myFollowingSet = new Set();

    if (currentUserId) {
      const myFollowings = await Follow.find({ follower: currentUserId }).select('following');
      myFollowingSet = new Set(myFollowings.map((f) => f.following.toString()));
    }

    const usersWithFollowStatus = users.map((u) => ({
      ...u.toObject(),
      isFollowing: myFollowingSet.has(u._id.toString()),
      isSelf: currentUserId ? currentUserId.toString() === u._id.toString() : false
    }));

    return ApiResponse.success(
      res,
      {
        users: usersWithFollowStatus,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      },
      'Search results retrieved'
    );
  } catch (error) {
    next(error);
  }
};
