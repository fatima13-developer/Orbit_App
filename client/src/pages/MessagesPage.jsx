import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { getUserConversations } from '../api/chat.api.js';
import { ConversationList } from '../components/chat/ConversationList.jsx';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(
    location.state?.activeConversation || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await getUserConversations();
        const convList = res.data.conversations || [];
        setConversations(convList);

        // If navigated with active conversation from state, or select first on desktop
        if (location.state?.activeConversation) {
          const match = convList.find((c) => c._id === location.state.activeConversation._id);
          setActiveConversation(match || location.state.activeConversation);
        } else if (window.innerWidth >= 768 && convList.length > 0 && !activeConversation) {
          setActiveConversation(convList[0]);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?._id, location.state]);

  const handleMessageSent = (newMsg) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === newMsg.conversation) {
          return {
            ...c,
            lastMessage: newMsg,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-6 h-[calc(100vh-4rem)] md:h-screen">
      <div className="h-full bg-white rounded-3xl border border-orbit-border shadow-warm-sm overflow-hidden flex">
        {/* Left List Column */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-orbit-border bg-white ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-orbit-border flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orbit-soft flex items-center justify-center text-orbit-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-orbit-text">Messages</h2>
              <p className="text-xs text-orbit-textMuted">Direct conversations</p>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-orbit-primary" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversation?._id}
                onSelectConversation={(conv) => setActiveConversation(conv)}
                currentUserId={user?._id}
              />
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div
          className={`flex-1 flex-col h-full bg-orange-50/10 ${
            activeConversation ? 'flex' : 'hidden md:flex items-center justify-center'
          }`}
        >
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              onBack={() => setActiveConversation(null)}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to start messaging in real-time."
            />
          )}
        </div>
      </div>
    </div>
  );
};
