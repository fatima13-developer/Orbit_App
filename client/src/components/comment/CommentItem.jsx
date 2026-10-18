import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, CornerDownRight } from 'lucide-react';
import { formatTimeAgo } from '../../utils/date.js';
import { likeComment, unlikeComment, deleteComment, createComment } from '../../api/comment.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';

export const CommentItem = ({
  comment,
  postId,
  postAuthorId,
  onCommentDeleted,
  onReplyAdded
}) => {
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();

  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const canDelete =
    user && (user._id === comment.author?._id || user._id === postAuthorId);

  const handleLikeToggle = () => {
    requireAuth('like this comment', async () => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

      try {
        if (nextLiked) {
          await likeComment(comment._id);
        } else {
          await unlikeComment(comment._id);
        }
      } catch (err) {
        // Revert on error
        setIsLiked(!nextLiked);
        setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      }
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      showToast('Comment deleted');
      if (onCommentDeleted) {
        onCommentDeleted(comment._id, comment.parentComment);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await createComment(postId, {
        content: replyText.trim(),
        parentComment: comment._id
      });

      setReplyText('');
      setShowReplyInput(false);
      showToast('Reply added!');

      if (onReplyAdded) {
        onReplyAdded(res.data.comment);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="py-3 border-b border-orbit-border/50 last:border-b-0">
      <div className="flex gap-3">
        <Link to={`/profile/${comment.author?.username}`}>
          <Avatar user={comment.author} size="sm" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-orange-50/50 rounded-2xl p-3 border border-orbit-border/60">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Link
                to={`/profile/${comment.author?.username}`}
                className="font-semibold text-xs text-orbit-text hover:text-orbit-primary transition-colors truncate"
              >
                {comment.author?.name}
                <span className="ml-1 text-[11px] font-normal text-orbit-textMuted">
                  @{comment.author?.username}
                </span>
              </Link>
              <span className="text-[10px] text-orbit-textMuted flex-shrink-0">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-orbit-text break-words">
              {comment.content}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-orbit-textMuted">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500 font-semibold' : ''
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount > 0 ? likesCount : ''}</span>
            </button>

            {/* Only top level comments can have replies */}
            {!comment.parentComment && (
              <button
                onClick={() => {
                  requireAuth('reply to this comment', () => setShowReplyInput(!showReplyInput));
                }}
                className="flex items-center gap-1 hover:text-orbit-primary transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                className="hover:text-red-600 transition-colors ml-auto"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <form onSubmit={handleReplySubmit} className="mt-2.5 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-orbit-textMuted flex-shrink-0" />
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to @${comment.author?.username}...`}
                className="flex-1 bg-white border border-orbit-border rounded-xl px-3 py-1.5 text-xs text-orbit-text focus:outline-none focus:ring-1 focus:ring-orbit-primary"
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submittingReply}
                className="btn-orbit-gradient text-xs px-3 py-1.5 rounded-xl disabled:opacity-50"
              >
                Send
              </button>
            </form>
          )}

          {/* Nested Replies (1 Level Deep) */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2.5 pl-3 sm:pl-5 border-l-2 border-orange-200">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex gap-2.5">
                  <Link to={`/profile/${reply.author?.username}`}>
                    <Avatar user={reply.author} size="xs" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="bg-orange-50/40 rounded-xl p-2.5 border border-orbit-border/50">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <Link
                          to={`/profile/${reply.author?.username}`}
                          className="font-semibold text-xs text-orbit-text hover:text-orbit-primary truncate"
                        >
                          {reply.author?.name}
                        </Link>
                        <span className="text-[10px] text-orbit-textMuted">
                          {formatTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-orbit-text break-words">
                        {reply.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 ml-1 text-[11px] text-orbit-textMuted">
                      {user && (user._id === reply.author?._id || user._id === postAuthorId) && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete reply?')) {
                              deleteComment(reply._id).then(() => {
                                onCommentDeleted(reply._id, comment._id);
                              });
                            }
                          }}
                          className="hover:text-red-500 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
