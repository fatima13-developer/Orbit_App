import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Image as ImageIcon, Heart, ArrowLeft } from 'lucide-react';
import { getUserProfile } from '../api/user.api.js';
import { getUserPosts } from '../api/post.api.js';
import { ProfileHeader } from '../components/profile/ProfileHeader.jsx';
import { PostCard } from '../components/post/PostCard.jsx';
import { ProfileSkeleton, FeedSkeleton, PostSkeleton } from '../components/common/Skeletons.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: authUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'media'

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await getUserProfile(username);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch Posts
  const fetchPosts = useCallback(
    async (cursor = '') => {
      try {
        const res = await getUserPosts(username, cursor, 10);
        const newPosts = res.data.posts || [];
        if (!cursor) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setLoadingPosts(false);
        setLoadingMore(false);
      }
    },
    [username]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    fetchPosts(nextCursor);
  }, [loadingMore, hasMore, nextCursor, fetchPosts]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore
  });

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  if (loadingProfile) {
    return (
      <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        <ProfileSkeleton />
        <div className="mt-6">
          <FeedSkeleton count={2} />
        </div>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-12 text-center">
        <EmptyState
          title="User not found"
          description="The user you are looking for does not exist on Orbit or may have changed their username."
          actionLabel="Return Home"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  const { user, isFollowing, isSelf } = profileData;

  // Filter posts based on active tab
  const displayedPosts =
    activeTab === 'media'
      ? posts.filter((p) => p.images && p.images.length > 0)
      : posts;

  return (
    <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Top back navigation */}
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/"
          className="p-2 rounded-xl text-orbit-textMuted hover:text-orbit-text hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-base font-bold text-orbit-text">{user.name}</h2>
          <p className="text-xs text-orbit-textMuted">{posts.length} posts</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <ProfileHeader
        profileUser={user}
        isSelf={isSelf}
        initialFollowing={isFollowing}
        onProfileChange={(updated) =>
          setProfileData((prev) => ({ ...prev, user: updated }))
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-orbit-border mb-6 bg-white rounded-2xl p-1 shadow-warm-sm">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'posts'
              ? 'bg-orbit-soft text-orbit-deepAccent shadow-sm'
              : 'text-orbit-textMuted hover:text-orbit-text'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'media'
              ? 'bg-orbit-soft text-orbit-deepAccent shadow-sm'
              : 'text-orbit-textMuted hover:text-orbit-text'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Media</span>
        </button>
      </div>

      {/* Posts Stream */}
      {loadingPosts ? (
        <FeedSkeleton count={2} />
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title={activeTab === 'media' ? 'No photos yet' : 'No posts yet'}
          description={
            isSelf
              ? 'Share your thoughts or photos to build your orbit presence!'
              : `@${user.username} hasn't posted anything in this category.`
          }
        />
      ) : (
        <div>
          {displayedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          <div ref={sentinelRef} className="py-2">
            {loadingMore && <PostSkeleton />}
          </div>
        </div>
      )}
    </div>
  );
};
