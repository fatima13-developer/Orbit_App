import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getFeed } from '../api/post.api.js';
import { CreatePostCard } from '../components/post/CreatePostCard.jsx';
import { PostCard } from '../components/post/PostCard.jsx';
import { FeedSkeleton, PostSkeleton } from '../components/common/Skeletons.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchFeed = useCallback(async (cursor = '') => {
    try {
      const res = await getFeed(cursor, 10);
      const newPosts = res.data.posts || [];

      if (!cursor) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    fetchFeed(nextCursor);
  }, [loadingMore, hasMore, nextCursor, fetchFeed]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore
  });

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Feed Title */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orbit-primary" />
          <h2 className="text-xl font-black text-orbit-text tracking-tight">
            Home Feed
          </h2>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchFeed();
          }}
          className="p-2 text-orbit-textMuted hover:text-orbit-primary rounded-xl hover:bg-orange-50 transition-colors"
          title="Refresh feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Create Post */}
      <CreatePostCard onPostCreated={handlePostCreated} />

      {/* Posts List */}
      {loading ? (
        <FeedSkeleton count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts in your orbit yet"
          description="Follow some interesting people from the right sidebar or share your first thought above!"
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="py-2">
            {loadingMore && <PostSkeleton />}
          </div>

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-xs text-orbit-textMuted py-6 font-medium">
              ✨ You have caught up with all posts in your orbit.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
