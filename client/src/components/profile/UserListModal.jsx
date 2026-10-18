import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../../api/user.api.js';
import { Avatar } from '../common/Avatar.jsx';
import { Modal } from '../common/Modal.jsx';
import { Loader2, Check, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export const UserListModal = ({ isOpen, onClose, userId, mode = 'followers' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, requireAuth } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res =
          mode === 'followers'
            ? await getFollowers(userId)
            : await getFollowing(userId);
        setUsers(mode === 'followers' ? res.data.followers : res.data.following);
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, mode]);

  const handleFollowToggle = (targetId, currentStatus) => {
    requireAuth('follow this user', async () => {
      setUsers((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, isFollowing: !currentStatus } : u))
      );

      try {
        if (currentStatus) {
          await unfollowUser(targetId);
        } else {
          await followUser(targetId);
        }
      } catch (err) {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) => (u._id === targetId ? { ...u, isFollowing: currentStatus } : u))
        );
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'followers' ? 'Followers' : 'Following'}
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orbit-primary" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-8 text-sm text-orbit-textMuted">
          {mode === 'followers'
            ? 'No followers yet.'
            : 'Not following anyone yet.'}
        </p>
      ) : (
        <div className="space-y-3 divide-y divide-orbit-border/50">
          {users.map((u) => (
            <div key={u._id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
              <Link
                to={`/profile/${u.username}`}
                onClick={onClose}
                className="flex items-center gap-3 min-w-0 group"
              >
                <Avatar user={u} size="md" isOnline={isUserOnline(u._id)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-orbit-text group-hover:text-orbit-primary truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-orbit-textMuted truncate">@{u.username}</p>
                </div>
              </Link>

              {(!user || user._id !== u._id) && (
                <button
                  onClick={() => handleFollowToggle(u._id, u.isFollowing)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    u.isFollowing
                      ? 'bg-orange-50 text-orbit-deepAccent border border-orange-200'
                      : 'btn-orbit-gradient'
                  }`}
                >
                  {u.isFollowing ? (
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
    </Modal>
  );
};
