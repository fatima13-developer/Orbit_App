import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { createComment } from '../../api/comment.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';

export const CommentInput = ({ postId, onCommentAdded }) => {
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => requireAuth('comment on this post')}
        className="w-full p-3 bg-orange-50/60 hover:bg-orange-100/60 transition-colors rounded-xl text-center text-xs font-semibold text-orbit-primary border border-orange-200"
      >
        Sign in to join the conversation and comment →
      </button>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await createComment(postId, { content: content.trim() });
      setContent('');
      if (onCommentAdded) {
        onCommentAdded(res.data.comment);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
      <Avatar user={user} size="sm" />
      <div className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          maxLength={1000}
          className="w-full bg-orange-50/70 border border-orbit-border rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-orbit-text placeholder:text-orbit-textMuted focus:outline-none focus:ring-1 focus:ring-orbit-primary focus:border-orbit-primary"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-orbit-primary hover:text-orbit-primaryDark disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
