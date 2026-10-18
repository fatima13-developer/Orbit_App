import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import { formatTimeAgo } from '../../utils/date.js';
import { getMediaUrl } from '../../utils/helpers.js';
import { Avatar } from '../common/Avatar.jsx';

export const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const { sender, type, post, read, createdAt } = notification;

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-orbit-primary" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-orbit-primary" />;
    }
  };

  const getActionText = () => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with you';
    }
  };

  const targetUrl = post
    ? `/post/${post._id || post}`
    : `/profile/${sender?.username}`;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
        read
          ? 'bg-white border-orbit-border/70'
          : 'bg-orange-50/70 border-orange-200 shadow-warm-sm'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Link to={`/profile/${sender?.username}`} className="flex-shrink-0 relative">
          <Avatar user={sender} size="md" />
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
            {getIcon()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-orbit-text leading-snug">
            <Link
              to={`/profile/${sender?.username}`}
              className="font-bold hover:text-orbit-primary transition-colors"
            >
              {sender?.name || 'Someone'}
            </Link>{' '}
            <span>{getActionText()}</span>
          </p>

          <Link
            to={targetUrl}
            onClick={() => !read && onMarkRead && onMarkRead(notification._id)}
            className="text-xs text-orbit-textMuted hover:text-orbit-primary block mt-1 line-clamp-1"
          >
            {post?.content ? `"${post.content}"` : 'View interaction'}
          </Link>

          <span className="text-[11px] text-orbit-textMuted mt-1 block">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
      </div>

      {/* Post Image Thumbnail if available */}
      {post?.images?.[0]?.url && (
        <Link to={targetUrl} className="flex-shrink-0">
          <img
            src={getMediaUrl(post.images[0].url)}
            alt="Thumbnail"
            className="w-11 h-11 rounded-xl object-cover border border-orbit-border"
          />
        </Link>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(notification._id)}
          className="text-orbit-textMuted hover:text-red-500 p-1 rounded-lg transition-colors"
          title="Delete notification"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
