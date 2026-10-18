import Post from '../models/Post.model.js';
import User from '../models/User.model.js';
import Like from '../models/Like.model.js';
import Follow from '../models/Follow.model.js';
import Comment from '../models/Comment.model.js';
import Notification from '../models/Notification.model.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { emitToUser } from '../config/socket.js';

// Helper to annotate posts with isLiked for the requesting user
const annotatePostsWithLikeStatus = async (posts, userId) => {
  if (!userId || posts.length === 0) {
    return posts.map((post) => {
      const obj = post.toObject ? post.toObject() : post;
      return { ...obj, isLiked: false };
    });
  }

  const postIds = posts.map((p) => p._id);
  const likes = await Like.find({
    user: userId,
    post: { $in: postIds }
  }).select('post');

  const likedPostIds = new Set(likes.map((l) => l.post.toString()));

  return posts.map((post) => {
    const obj = post.toObject ? post.toObject() : post;
    return {
      ...obj,
      isLiked: likedPostIds.has(post._id.toString())
    };
  });
};

export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const files = req.files || [];

    if ((!content || content.trim().length === 0) && files.length === 0) {
      return next(ApiError.badRequest('Post must contain text or at least one image'));
    }

    if (files.length > 4) {
      return next(ApiError.badRequest('You can upload at most 4 images per post'));
    }

    const uploadedImages = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file, 'posts');
      uploadedImages.push({
        url: result.url,
        publicId: result.publicId
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content ? content.trim() : '',
      images: uploadedImages
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username avatar bio'
    );

    const [annotated] = await annotatePostsWithLikeStatus([populatedPost], req.user._id);

    return ApiResponse.created(res, { post: annotated }, 'Post published successfully');
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const cursor = req.query.cursor; // ISO date string

    let filter = {};

    if (req.user) {
      // Find all users the current user follows + include own ID
      const myFollowings = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = myFollowings.map((f) => f.following);
      const feedAuthorIds = [...followingIds, req.user._id];
      filter.author = { $in: feedAuthorIds };
    }

    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    let posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', 'name username avatar bio');

    // If feed is empty or short (e.g. new user or guest), fill with latest posts
    if (posts.length === 0 && !cursor) {
      posts = await Post.find({})
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('author', 'name username avatar bio');
    }

    const hasMore = posts.length > limit;
    if (hasMore) {
      posts.pop();
    }

    const nextCursor = posts.length > 0 && hasMore ? posts[posts.length - 1].createdAt.toISOString() : null;
    const userId = req.user ? req.user._id : null;
    const annotated = await annotatePostsWithLikeStatus(posts, userId);

    return ApiResponse.success(res, { posts: annotated, nextCursor, hasMore }, 'Feed retrieved');
  } catch (error) {
    next(error);
  }
};

export const getExplorePosts = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const cursor = req.query.cursor;

    const filter = {};
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', 'name username avatar bio');

    const hasMore = posts.length > limit;
    if (hasMore) {
      posts.pop();
    }

    const nextCursor = posts.length > 0 && hasMore ? posts[posts.length - 1].createdAt.toISOString() : null;
    const userId = req.user ? req.user._id : null;
    const annotated = await annotatePostsWithLikeStatus(posts, userId);

    return ApiResponse.success(res, { posts: annotated, nextCursor, hasMore }, 'Explore posts retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const cursor = req.query.cursor;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    const filter = { author: user._id };
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', 'name username avatar bio');

    const hasMore = posts.length > limit;
    if (hasMore) {
      posts.pop();
    }

    const nextCursor = posts.length > 0 && hasMore ? posts[posts.length - 1].createdAt.toISOString() : null;
    const userId = req.user ? req.user._id : null;
    const annotated = await annotatePostsWithLikeStatus(posts, userId);

    return ApiResponse.success(res, { posts: annotated, nextCursor, hasMore }, 'User posts retrieved');
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name username avatar bio');
    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    const userId = req.user ? req.user._id : null;
    const [annotated] = await annotatePostsWithLikeStatus([post], userId);

    return ApiResponse.success(res, { post: annotated }, 'Post retrieved');
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only edit your own posts'));
    }

    post.content = content.trim();
    await post.save();

    const populated = await Post.findById(post._id).populate('author', 'name username avatar bio');
    const [annotated] = await annotatePostsWithLikeStatus([populated], req.user._id);

    return ApiResponse.success(res, { post: annotated }, 'Post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only delete your own posts'));
    }

    // Delete associated images from Cloudinary
    for (const img of post.images) {
      if (img.publicId) {
        deleteFromCloudinary(img.publicId).catch((err) =>
          console.warn('Failed to delete post image:', err.message)
        );
      }
    }

    await Post.findByIdAndDelete(post._id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

    // Clean up comments, likes, notifications
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });

    return ApiResponse.success(res, null, 'Post deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      return ApiResponse.success(res, { isLiked: true, likesCount: post.likesCount }, 'Post already liked');
    }

    await Like.create({
      user: userId,
      post: postId,
      targetType: 'Post'
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    // Notify author if not liking own post
    if (post.author.toString() !== userId.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: postId
      });

      const populatedNotif = await Notification.findById(notification._id).populate(
        'sender',
        'name username avatar'
      );
      emitToUser(post.author, 'new_notification', populatedNotif);
    }

    return ApiResponse.success(
      res,
      { isLiked: true, likesCount: updatedPost.likesCount },
      'Post liked successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const existingLike = await Like.findOneAndDelete({ user: userId, post: postId });

    if (!existingLike) {
      const post = await Post.findById(postId);
      return ApiResponse.success(
        res,
        { isLiked: false, likesCount: post ? post.likesCount : 0 },
        'Post is not liked'
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return ApiResponse.success(
      res,
      { isLiked: false, likesCount: Math.max(0, updatedPost.likesCount) },
      'Post unliked successfully'
    );
  } catch (error) {
    next(error);
  }
};
