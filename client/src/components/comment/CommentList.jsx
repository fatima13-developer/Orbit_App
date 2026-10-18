import React, { useState, useEffect } from 'react';
import { getComments } from '../../api/comment.api.js';
import { CommentItem } from './CommentItem.jsx';
import { CommentInput } from './CommentInput.jsx';
import { Loader2 } from 'lucide-react';

export const CommentList = ({ postId, postAuthorId, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitialComments = async () => {
      setLoading(true);
      try {
        const res = await getComments(postId, 1, 10);
        setComments(res.data.comments || []);
        setHasMore(res.data.page < res.data.totalPages);
        setPage(1);
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };

    fetchInitialComments();
  }, [postId]);

  const loadMoreComments = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getComments(postId, nextPage, 10);
      setComments((prev) => [...prev, ...res.data.comments]);
      setPage(nextPage);
      setHasMore(res.data.page < res.data.totalPages);
    } catch (err) {
      // Silently catch
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    newComment.replies = [];
    setComments((prev) => [newComment, ...prev]);
    if (onCommentCountChange) {
      onCommentCountChange(1);
    }
  };

  const handleReplyAdded = (newReply) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === newReply.parentComment) {
          return {
            ...c,
            repliesCount: (c.repliesCount || 0) + 1,
            replies: [...(c.replies || []), newReply]
          };
        }
        return c;
      })
    );
    if (onCommentCountChange) {
      onCommentCountChange(1);
    }
  };

  const handleCommentDeleted = (commentId, parentCommentId) => {
    if (!parentCommentId) {
      // Top level comment deleted
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } else {
      // Reply deleted
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === parentCommentId) {
            return {
              ...c,
              repliesCount: Math.max(0, (c.repliesCount || 1) - 1),
              replies: c.replies.filter((r) => r._id !== commentId)
            };
          }
          return c;
        })
      );
    }
    if (onCommentCountChange) {
      onCommentCountChange(-1);
    }
  };

  return (
    <div className="pt-3 border-t border-orbit-border/70 mt-3 space-y-4">
      {/* Input */}
      <CommentInput postId={postId} onCommentAdded={handleCommentAdded} />

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-4 text-orbit-textMuted">
          <Loader2 className="w-5 h-5 animate-spin text-orbit-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-orbit-textMuted text-center py-3">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMoreComments}
              disabled={loadingMore}
              className="w-full text-center text-xs font-semibold text-orbit-primary hover:text-orbit-primaryDark py-2 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading more comments...' : 'View previous comments'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
