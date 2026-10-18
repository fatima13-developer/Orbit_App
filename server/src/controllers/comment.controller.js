import Comment from '../models/Comment.model.js';
import Post from '../models/Post.model.js';
import Like from '../models/Like.model.js';
import Notification from '../models/Notification.model.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import { emitToUser } from '../config/socket.js';

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return next(ApiError.notFound('Post not found'));
    }

    let parentDoc = null;
    if (parentComment) {
      parentDoc = await Comment.findById(parentComment);
      if (!parentDoc) {
        return next(ApiError.notFound('Parent comment not found'));
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content,
      parentComment: parentComment || null
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $inc: { repliesCount: 1 } });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name username avatar'
    );

    // Send notification
    if (parentComment && parentDoc && parentDoc.author.toString() !== userId.toString()) {
      // Notify parent comment author of reply
      const notif = await Notification.create({
        recipient: parentDoc.author,
        sender: userId,
        type: 'reply',
        post: postId,
        comment: comment._id
      });
      const popNotif = await Notification.findById(notif._id).populate('sender', 'name username avatar');
      emitToUser(parentDoc.author, 'new_notification', popNotif);
    } else if (!parentComment && post.author.toString() !== userId.toString()) {
      // Notify post author of comment
      const notif = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: comment._id
      });
      const popNotif = await Notification.findById(notif._id).populate('sender', 'name username avatar');
      emitToUser(post.author, 'new_notification', popNotif);
    }

    return ApiResponse.created(res, { comment: populatedComment }, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    // Fetch top-level comments
    const topLevelComments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name username avatar');

    const topCommentIds = topLevelComments.map((c) => c._id);

    // Fetch replies for these comments
    const replies = await Comment.find({
      post: postId,
      parentComment: { $in: topCommentIds }
    })
      .sort({ createdAt: 1 })
      .populate('author', 'name username avatar');

    // Attach likes if user logged in
    const userId = req.user ? req.user._id : null;
    let likedCommentIds = new Set();

    if (userId) {
      const allCommentIds = [...topCommentIds, ...replies.map((r) => r._id)];
      const likes = await Like.find({
        user: userId,
        comment: { $in: allCommentIds }
      }).select('comment');
      likedCommentIds = new Set(likes.map((l) => l.comment.toString()));
    }

    // Group replies by parent comment
    const repliesMap = {};
    for (const reply of replies) {
      const parentId = reply.parentComment.toString();
      if (!repliesMap[parentId]) repliesMap[parentId] = [];
      const replyObj = reply.toObject();
      replyObj.isLiked = likedCommentIds.has(reply._id.toString());
      repliesMap[parentId].push(replyObj);
    }

    const commentsWithReplies = topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      commentObj.isLiked = likedCommentIds.has(comment._id.toString());
      commentObj.replies = repliesMap[comment._id.toString()] || [];
      return commentObj;
    });

    const totalTopLevel = await Comment.countDocuments({ post: postId, parentComment: null });

    return ApiResponse.success(
      res,
      {
        comments: commentsWithReplies,
        page,
        totalPages: Math.ceil(totalTopLevel / limit),
        totalComments: totalTopLevel
      },
      'Comments retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(ApiError.notFound('Comment not found'));
    }

    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.author.toString() === userId.toString();
    const isPostAuthor = post && post.author.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return next(ApiError.forbidden('You are not authorized to delete this comment'));
    }

    // If it's a top-level comment, also remove replies
    let deletedCount = 1;
    if (!comment.parentComment) {
      const replies = await Comment.find({ parentComment: comment._id });
      deletedCount += replies.length;
      await Comment.deleteMany({ parentComment: comment._id });
    } else {
      // If it's a reply, decrement parentComment repliesCount
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }

    await Comment.findByIdAndDelete(comment._id);
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -deletedCount } });

    // Clean up likes
    await Like.deleteMany({ comment: comment._id });

    return ApiResponse.success(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(ApiError.notFound('Comment not found'));
    }

    const existingLike = await Like.findOne({ user: userId, comment: id });
    if (existingLike) {
      return ApiResponse.success(res, { isLiked: true, likesCount: comment.likesCount }, 'Comment already liked');
    }

    await Like.create({
      user: userId,
      comment: id,
      targetType: 'Comment'
    });

    const updated = await Comment.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    return ApiResponse.success(res, { isLiked: true, likesCount: updated.likesCount }, 'Comment liked');
  } catch (error) {
    next(error);
  }
};

export const unlikeComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOneAndDelete({ user: userId, comment: id });
    if (!existingLike) {
      const comment = await Comment.findById(id);
      return ApiResponse.success(res, { isLiked: false, likesCount: comment ? comment.likesCount : 0 }, 'Comment not liked');
    }

    const updated = await Comment.findByIdAndUpdate(
      id,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return ApiResponse.success(
      res,
      { isLiked: false, likesCount: Math.max(0, updated.likesCount) },
      'Comment unliked'
    );
  } catch (error) {
    next(error);
  }
};
