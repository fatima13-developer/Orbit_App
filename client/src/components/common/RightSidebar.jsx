import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, UserPlus, Check, LogIn } from 'lucide-react';
import { getSuggestedUsers, followUser, unfollowUser } from '../../api/user.api.js';
import { Avatar } from './Avatar.jsx';
import { Button } from './Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export const RightSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const { user, requireAuth } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await getSuggestedUsers();
        setSuggested(res.data.suggested || []);
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };

    fetchSuggested();
  }, [user?._id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleFollowToggle = async (targetUser) => {
    requireAuth(`follow @${targetUser.username}`, async () => {
      const targetId = targetUser._id;
      const isFollowing = followingMap[targetId];
      setFollowingMap((prev) => ({ ...prev, [targetId]: !isFollowing }));

      try {
        if (isFollowing) {
          await unfollowUser(targetId);
        } else {
          await followUser(targetId);
        }
      } catch (err) {
        // Revert on error
        setFollowingMap((prev) => ({ ...prev, [targetId]: isFollowing }));
      }
    });
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 px-4 py-6 space-y-6 overflow-y-auto select-none border-l border-orbit-border bg-white/50 backdrop-blur-sm">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search people on Orbit..."
          className="w-full bg-orange-50/70 border border-orbit-border rounded-2xl pl-11 pr-4 py-2.5 text-sm text-orbit-text placeholder:text-orbit-textMuted focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary transition-all"
        />
      </form>

      {/* Guest Card: "Join Orbit" */}
      {!user && (
        <div className="bg-gradient-to-br from-orange-500/15 via-orange-100/50 to-white rounded-3xl p-5 border border-orange-200 shadow-warm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-orbit-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              O
            </div>
            <h3 className="font-black text-base text-orbit-text">Join Orbit Today</h3>
          </div>
          <p className="text-xs text-orbit-textMuted mb-4 leading-relaxed">
            Connect with thinkers, designers, and developers. Like posts, start conversations, and follow your favorite voices.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/register')}
              variant="primary"
              size="sm"
              className="w-full font-bold shadow-sm"
              icon={UserPlus}
            >
              Sign up with Email
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="w-full font-bold bg-white"
              icon={LogIn}
            >
              Sign in to Account
            </Button>
          </div>
        </div>
      )}

      {/* Suggested Users */}
      <div className="bg-white rounded-2xl p-4 border border-orbit-border shadow-warm-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-orbit-primary" />
          <h3 className="font-bold text-sm text-orbit-text">Who to follow</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-100" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-orange-100 rounded" />
                    <div className="h-2.5 w-14 bg-orange-50 rounded" />
                  </div>
                </div>
                <div className="h-7 w-16 bg-orange-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p className="text-xs text-orbit-textMuted text-center py-2">
            No suggestions available right now.
          </p>
        ) : (
          <div className="space-y-3">
            {suggested.map((sUser) => {
              const isFollowing = followingMap[sUser._id];
              return (
                <div
                  key={sUser._id}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    to={`/profile/${sUser.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <Avatar
                      user={sUser}
                      size="sm"
                      isOnline={isUserOnline(sUser._id)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-orbit-text group-hover:text-orbit-primary transition-colors truncate">
                        {sUser.name}
                      </p>
                      <p className="text-xs text-orbit-textMuted truncate">
                        @{sUser.username}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(sUser)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isFollowing
                        ? 'bg-orange-50 text-orbit-deepAccent border border-orange-200 hover:bg-orange-100'
                        : 'btn-orbit-gradient'
                    }`}
                  >
                    {isFollowing ? (
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Orbit Highlights / Trending Card */}
      <div className="bg-gradient-to-br from-orange-500/10 via-orange-100/40 to-white rounded-2xl p-4 border border-orange-200/80 shadow-warm-sm">
        <h4 className="text-xs font-bold text-orbit-deepAccent uppercase tracking-wider mb-2">
          Discover Orbit
        </h4>
        <div className="space-y-2.5">
          <div>
            <p className="text-xs text-orbit-textMuted">Design • Trending</p>
            <p className="text-sm font-bold text-orbit-text">#CleanWeb2026</p>
            <p className="text-[11px] text-orbit-textMuted">12.4k posts</p>
          </div>
          <div>
            <p className="text-xs text-orbit-textMuted">Technology • Active</p>
            <p className="text-sm font-bold text-orbit-text">#SocketIORealTime</p>
            <p className="text-[11px] text-orbit-textMuted">8.9k posts</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
