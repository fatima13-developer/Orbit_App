import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  MessageCircle,
  UserPlus,
  Check,
  Edit3
} from 'lucide-react';
import { getCoverUrl, formatNumber } from '../../utils/helpers.js';
import { followUser, unfollowUser } from '../../api/user.api.js';
import { getOrCreateConversation } from '../../api/chat.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Button } from '../common/Button.jsx';
import { EditProfileModal } from './EditProfileModal.jsx';
import { UserListModal } from './UserListModal.jsx';

export const ProfileHeader = ({ profileUser, isSelf, initialFollowing, onProfileChange }) => {
  const { user, requireAuth } = useAuth();
  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(profileUser);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(profileUser.followersCount || 0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userListModal, setUserListModal] = useState({ isOpen: false, mode: 'followers' });
  const [startingChat, setStartingChat] = useState(false);

  const handleFollowToggle = () => {
    requireAuth(`follow @${currentUser.username}`, async () => {
      const nextState = !isFollowing;
      setIsFollowing(nextState);
      setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

      try {
        if (nextState) {
          await followUser(currentUser._id);
        } else {
          await unfollowUser(currentUser._id);
        }
      } catch (err) {
        setIsFollowing(!nextState);
        setFollowersCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        showToast('Action failed', 'error');
      }
    });
  };

  const handleStartChat = () => {
    requireAuth(`send direct messages to @${currentUser.username}`, async () => {
      setStartingChat(true);
      try {
        const res = await getOrCreateConversation(currentUser._id);
        navigate('/messages', { state: { activeConversation: res.data.conversation } });
      } catch (err) {
        showToast('Could not start conversation', 'error');
      } finally {
        setStartingChat(false);
      }
    });
  };

  const handleProfileUpdated = (updated) => {
    setCurrentUser(updated);
    if (onProfileChange) {
      onProfileChange(updated);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-orbit-border shadow-warm-sm overflow-hidden mb-6">
      {/* Cover Photo */}
      <div className="h-44 sm:h-64 relative bg-orange-100 overflow-hidden">
        <img
          src={getCoverUrl(currentUser)}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Profile Details Container */}
      <div className="px-5 sm:px-8 pb-6 relative">
        {/* Avatar & Action Row */}
        <div className="flex justify-between items-end -mt-14 sm:-mt-20 mb-4 flex-wrap gap-4">
          <Avatar
            user={currentUser}
            size="2xl"
            isOnline={isUserOnline(currentUser._id)}
            className="ring-4 ring-white shadow-warm"
          />

          <div className="flex items-center gap-2">
            {isSelf ? (
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                size="md"
                icon={Edit3}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleStartChat}
                  variant="outline"
                  size="md"
                  loading={startingChat}
                  icon={MessageCircle}
                >
                  Message
                </Button>

                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="md"
                  icon={isFollowing ? Check : UserPlus}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-orbit-text">
              {currentUser.name}
            </h2>
            <p className="text-sm font-semibold text-orbit-primary">
              @{currentUser.username}
            </p>
          </div>

          {currentUser.bio && (
            <p className="text-sm sm:text-base text-orbit-text leading-relaxed max-w-2xl break-words">
              {currentUser.bio}
            </p>
          )}

          {/* Metadata: Location, Website, Join Date */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-orbit-textMuted pt-1">
            {currentUser.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orbit-primary flex-shrink-0" />
                <span>{currentUser.location}</span>
              </div>
            )}

            {currentUser.website && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-orbit-primary flex-shrink-0" />
                <a
                  href={currentUser.website.startsWith('http') ? currentUser.website : `https://${currentUser.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orbit-primary hover:underline truncate max-w-xs"
                >
                  {currentUser.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orbit-textMuted flex-shrink-0" />
              <span>
                Joined {new Date(currentUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Social Stats: Following, Followers, Posts */}
          <div className="flex items-center gap-6 pt-3 border-t border-orbit-border/70 text-sm">
            <button
              onClick={() => setUserListModal({ isOpen: true, mode: 'following' })}
              className="hover:text-orbit-primary transition-colors text-left"
            >
              <span className="font-extrabold text-orbit-text">{formatNumber(currentUser.followingCount || 0)}</span>{' '}
              <span className="text-orbit-textMuted">Following</span>
            </button>

            <button
              onClick={() => setUserListModal({ isOpen: true, mode: 'followers' })}
              className="hover:text-orbit-primary transition-colors text-left"
            >
              <span className="font-extrabold text-orbit-text">{formatNumber(followersCount)}</span>{' '}
              <span className="text-orbit-textMuted">Followers</span>
            </button>

            <div>
              <span className="font-extrabold text-orbit-text">{formatNumber(currentUser.postsCount || 0)}</span>{' '}
              <span className="text-orbit-textMuted">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userProfile={currentUser}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Followers / Following Modal */}
      {userListModal.isOpen && (
        <UserListModal
          isOpen={userListModal.isOpen}
          onClose={() => setUserListModal({ ...userListModal, isOpen: false })}
          userId={currentUser._id}
          mode={userListModal.mode}
        />
      )}
    </div>
  );
};
