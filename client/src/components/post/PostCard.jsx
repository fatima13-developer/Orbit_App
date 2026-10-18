import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/date.js';
import { getMediaUrl, formatNumber } from '../../utils/helpers.js';
import { likePost, unlikePost, deletePost } from '../../api/post.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { EditPostModal } from './EditPostModal.jsx';
import { ImageGalleryModal } from './ImageGalleryModal.jsx';
import { CommentList } from '../comment/CommentList.jsx';

export const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user, requireAuth } = useAuth();
  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const isOwner = user && user._id === currentPost.author?._id;

  const handleLikeToggle = () => {
    requireAuth('like this post', async () => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

      try {
        if (nextLiked) {
          await likePost(currentPost._id);
        } else {
          await unlikePost(currentPost._id);
        }
      } catch (err) {
        // Revert optimistic update
        setIsLiked(!nextLiked);
        setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      }
    });
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(currentPost._id);
      showToast('Post deleted');
      if (onPostDeleted) {
        onPostDeleted(currentPost._id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete post', 'error');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${currentPost._id}`;
    navigator.clipboard.writeText(postUrl);
    showToast('Post link copied to clipboard!');
  };

  const handlePostUpdated = (updated) => {
    setCurrentPost(updated);
    if (onPostUpdated) {
      onPostUpdated(updated);
    }
  };

  const openGallery = (idx) => {
    setGalleryIndex(idx);
    setGalleryOpen(true);
  };

  const images = currentPost.images || [];

  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 border border-orbit-border shadow-warm-sm mb-4 transition-all hover:shadow-warm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          to={`/profile/${currentPost.author?.username}`}
          className="flex items-center gap-3 min-w-0 group"
        >
          <Avatar
            user={currentPost.author}
            size="md"
            isOnline={isUserOnline(currentPost.author?._id)}
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-orbit-text group-hover:text-orbit-primary transition-colors truncate">
              {currentPost.author?.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-orbit-textMuted">
              <span className="truncate">@{currentPost.author?.username}</span>
              <span>•</span>
              <span className="flex-shrink-0">{formatTimeAgo(currentPost.createdAt)}</span>
            </div>
          </div>
        </Link>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl text-orbit-textMuted hover:text-orbit-text hover:bg-orange-50 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-warm-lg border border-orbit-border py-1.5 z-20"
              onMouseLeave={() => setShowMenu(false)}
            >
              <Link
                to={`/post/${currentPost._id}`}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-orbit-text hover:bg-orange-50"
              >
                <ExternalLink className="w-4 h-4 text-orbit-textMuted" />
                <span>Go to post</span>
              </Link>

              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-orbit-text hover:bg-orange-50 text-left"
                  >
                    <Edit2 className="w-4 h-4 text-orbit-textMuted" />
                    <span>Edit post</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete post</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {currentPost.content && (
        <p className="text-sm sm:text-base text-orbit-text leading-relaxed whitespace-pre-wrap mb-3 break-words">
          {currentPost.content}
        </p>
      )}

      {/* Image Grid (Up to 4 images) */}
      {images.length > 0 && (
        <div
          className={`rounded-2xl overflow-hidden mb-3.5 border border-orbit-border/80 bg-orange-50/20 ${
            images.length === 1
              ? 'max-h-[500px]'
              : images.length === 2
              ? 'grid grid-cols-2 gap-1.5 aspect-[16/9]'
              : images.length === 3
              ? 'grid grid-cols-2 gap-1.5 aspect-[16/9]'
              : 'grid grid-cols-2 gap-1.5 aspect-square'
          }`}
        >
          {images.length === 1 && (
            <img
              src={getMediaUrl(images[0].url)}
              alt="Post media"
              onClick={() => openGallery(0)}
              className="w-full h-auto max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
            />
          )}

          {images.length === 2 &&
            images.map((img, i) => (
              <img
                key={i}
                src={getMediaUrl(img.url)}
                alt={`Post media ${i + 1}`}
                onClick={() => openGallery(i)}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            ))}

          {images.length === 3 && (
            <>
              <img
                src={getMediaUrl(images[0].url)}
                alt="Post media 1"
                onClick={() => openGallery(0)}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity row-span-2"
              />
              <div className="grid grid-rows-2 gap-1.5 h-full">
                <img
                  src={getMediaUrl(images[1].url)}
                  alt="Post media 2"
                  onClick={() => openGallery(1)}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
                <img
                  src={getMediaUrl(images[2].url)}
                  alt="Post media 3"
                  onClick={() => openGallery(2)}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
              </div>
            </>
          )}

          {images.length === 4 &&
            images.map((img, i) => (
              <img
                key={i}
                src={getMediaUrl(img.url)}
                alt={`Post media ${i + 1}`}
                onClick={() => openGallery(i)}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-orbit-border/70 text-xs sm:text-sm text-orbit-textMuted select-none">
        <div className="flex items-center gap-6">
          {/* Like */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-xl transition-all ${
              isLiked
                ? 'text-red-500 font-semibold bg-red-50'
                : 'hover:text-red-500 hover:bg-red-50/50'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isLiked ? 'fill-current' : ''
              }`}
            />
            <span>{formatNumber(likesCount)}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-xl transition-all ${
              showComments
                ? 'text-orbit-primary font-semibold bg-orange-50'
                : 'hover:text-orbit-primary hover:bg-orange-50/50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(commentsCount)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:text-orbit-primary hover:bg-orange-50/50 transition-all"
            title="Share post"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* View Details Link */}
        <Link
          to={`/post/${currentPost._id}`}
          className="text-xs text-orbit-textMuted hover:text-orbit-primary transition-colors"
        >
          Details
        </Link>
      </div>

      {/* Comment Section (Collapsible) */}
      {showComments && (
        <CommentList
          postId={currentPost._id}
          postAuthorId={currentPost.author?._id}
          onCommentCountChange={(diff) => setCommentsCount((prev) => Math.max(0, prev + diff))}
        />
      )}

      {/* Modals */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={currentPost}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {galleryOpen && (
        <ImageGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={images}
          initialIndex={galleryIndex}
        />
      )}
    </article>
  );
};
