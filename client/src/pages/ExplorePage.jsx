import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Users, Check, UserPlus } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce.js';
import { searchUsers, followUser, unfollowUser } from '../api/user.api.js';
import { getExplorePosts } from '../api/post.api.js';
import { PostCard } from '../components/post/PostCard.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { FeedSkeleton, PostSkeleton, UserRowSkeleton } from '../components/common/Skeletons.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 350);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [explorePosts, setExplorePosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const { user, requireAuth } = useAuth();
  const { isUserOnline } = useSocket();

  // Search users when debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const performSearch = async () => {
      setSearching(true);
      try {
        const res = await searchUsers(debouncedQuery.trim());
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
    setSearchParams(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {});
  }, [debouncedQuery, setSearchParams]);

  // Fetch explore posts
  const fetchExplore = useCallback(async (cursor = '') => {
    try {
      const res = await getExplorePosts(cursor, 10);
      const newPosts = res.data.posts || [];
      if (!cursor) {
        setExplorePosts(newPosts);
      } else {
        setExplorePosts((prev) => [...prev, ...newPosts]);
      }
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExplore();
  }, [fetchExplore]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    fetchExplore(nextCursor);
  }, [loadingMore, hasMore, nextCursor, fetchExplore]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore
  });

  const handleFollowToggle = (targetUser, currentStatus) => {
    requireAuth(`follow @${targetUser.username}`, async () => {
      const targetId = targetUser._id;
      setSearchResults((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, isFollowing: !currentStatus } : u))
      );

      try {
        if (currentStatus) {
          await unfollowUser(targetId);
        } else {
          await followUser(targetId);
        }
      } catch (err) {
        // Revert
        setSearchResults((prev) =>
          prev.map((u) => (u._id === targetId ? { ...u, isFollowing: currentStatus } : u))
        );
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or @username..."
            className="w-full bg-white border border-orbit-border rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-orbit-text placeholder:text-orbit-textMuted shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary transition-all"
          />
        </div>
      </div>

      {/* User Search Results if searching */}
      {debouncedQuery.trim() && (
        <div className="mb-8 bg-white rounded-2xl p-4 sm:p-5 border border-orbit-border shadow-warm-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-orbit-primary" />
            <h3 className="font-bold text-sm text-orbit-text">
              User Results for "{debouncedQuery}"
            </h3>
          </div>

          {searching ? (
            <div className="space-y-2">
              <UserRowSkeleton />
              <UserRowSkeleton />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-xs text-orbit-textMuted text-center py-4">
              No matching users found on Orbit.
            </p>
          ) : (
            <div className="divide-y divide-orbit-border/50">
              {searchResults.map((sUser) => (
                <div
                  key={sUser._id}
                  className="py-3 first:pt-0 flex items-center justify-between gap-3"
                >
                  <Link
                    to={`/profile/${sUser.username}`}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    <Avatar
                      user={sUser}
                      size="md"
                      isOnline={isUserOnline(sUser._id)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-orbit-text group-hover:text-orbit-primary truncate">
                        {sUser.name}
                      </p>
                      <p className="text-xs text-orbit-textMuted truncate">
                        @{sUser.username}
                      </p>
                      {sUser.bio && (
                        <p className="text-xs text-orbit-textMuted line-clamp-1 mt-0.5">
                          {sUser.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {!sUser.isSelf && (
                    <button
                      onClick={() => handleFollowToggle(sUser, sUser.isFollowing)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        sUser.isFollowing
                          ? 'bg-orange-50 text-orbit-deepAccent border border-orange-200'
                          : 'btn-orbit-gradient'
                      }`}
                    >
                      {sUser.isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Explore Feed Title */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <Compass className="w-5 h-5 text-orbit-primary" />
        <h2 className="text-xl font-black text-orbit-text tracking-tight">
          Trending on Orbit
        </h2>
      </div>

      {/* Explore Posts Stream */}
      {loadingPosts ? (
        <FeedSkeleton count={3} />
      ) : explorePosts.length === 0 ? (
        <EmptyState
          title="No trending posts yet"
          description="Be the first to share an inspiring update!"
        />
      ) : (
        <div>
          {explorePosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          <div ref={sentinelRef} className="py-2">
            {loadingMore && <PostSkeleton />}
          </div>

          {!hasMore && explorePosts.length > 0 && (
            <p className="text-center text-xs text-orbit-textMuted py-6 font-medium">
              ✨ You have seen all trending posts.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
