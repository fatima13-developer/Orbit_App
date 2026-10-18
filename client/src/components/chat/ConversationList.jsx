import React from 'react';
import { formatTimeAgo } from '../../utils/date.js';
import { Avatar } from '../common/Avatar.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export const ConversationList = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  currentUserId
}) => {
  const { isUserOnline } = useSocket();

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-orbit-textMuted">
        No active chats. Tap 'Message' on a profile to start chatting!
      </div>
    );
  }

  return (
    <div className="divide-y divide-orbit-border/60 overflow-y-auto">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants?.find(
          (p) => p._id !== currentUserId
        ) || conv.participants?.[0];

        const isActive = conv._id === activeConversationId;
        const unread = conv.unreadCounts?.[currentUserId] || 0;

        return (
          <button
            key={conv._id}
            onClick={() => onSelectConversation(conv)}
            className={`w-full p-4 flex items-center gap-3.5 transition-colors text-left ${
              isActive
                ? 'bg-orange-50/80 border-r-4 border-orbit-primary'
                : 'hover:bg-orange-50/40 bg-white'
            }`}
          >
            <Avatar
              user={otherParticipant}
              size="md"
              isOnline={isUserOnline(otherParticipant?._id)}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4 className="text-sm font-bold text-orbit-text truncate">
                  {otherParticipant?.name}
                </h4>
                {conv.updatedAt && (
                  <span className="text-[10px] text-orbit-textMuted flex-shrink-0">
                    {formatTimeAgo(conv.updatedAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-orbit-textMuted truncate">
                  {conv.lastMessage?.text || (conv.lastMessage?.image?.url ? '📷 Image' : 'Started conversation')}
                </p>

                {unread > 0 && (
                  <span className="bg-orbit-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
