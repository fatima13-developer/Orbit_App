import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { getMessages, sendMessage, markConversationSeen } from '../../api/chat.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { MessageBubble } from './MessageBubble.jsx';

export const ChatWindow = ({ conversation, onBack, onMessageSent }) => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParticipant = conversation.participants?.find(
    (p) => p._id !== user._id
  ) || conversation.participants?.[0];

  const conversationId = conversation._id;

  // Fetch messages
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getMessages(conversationId, 1, 50);
        if (isMounted) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        // Silently catch
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    markConversationSeen(conversationId).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Socket setup for this conversation room
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (msg) => {
      if (msg.conversation === conversationId) {
        setMessages((prev) => [...prev, msg]);
        markConversationSeen(conversationId).catch(() => {});
      }
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId && data.user._id !== user._id) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.conversationId === conversationId) {
        setOtherUserTyping(false);
      }
    };

    const handleMessagesSeen = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender._id === user._id ? { ...m, seenBy: [...(m.seenBy || []), data.userId] } : m
          )
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_seen', handleMessagesSeen);
    };
  }, [socket, conversationId, user._id]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (socket) {
      socket.emit('typing', { conversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId });
      }, 1500);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size cannot exceed 5MB', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || sending) return;

    setSending(true);
    if (socket) socket.emit('stop_typing', { conversationId });

    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await sendMessage(conversationId, formData);
      const sentMsg = res.data.message;

      // Local append if not already received via socket
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });

      setText('');
      clearImage();

      if (onMessageSent) {
        onMessageSent(sentMsg);
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-orbit-border shadow-warm-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-orbit-border flex items-center justify-between bg-orange-50/40">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 text-orbit-textMuted hover:text-orbit-text rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link
            to={`/profile/${otherParticipant?.username}`}
            className="flex items-center gap-3 group"
          >
            <Avatar
              user={otherParticipant}
              size="md"
              isOnline={isUserOnline(otherParticipant?._id)}
            />
            <div>
              <h3 className="text-sm font-bold text-orbit-text group-hover:text-orbit-primary transition-colors">
                {otherParticipant?.name}
              </h3>
              <p className="text-[11px] font-medium text-orbit-textMuted">
                {isUserOnline(otherParticipant?._id) ? (
                  <span className="text-green-600 font-semibold">Online</span>
                ) : (
                  <span>Offline</span>
                )}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto bg-orange-50/20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-orbit-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-orbit-textMuted">
            <p className="text-sm">Say hello to {otherParticipant?.name}! 👋</p>
          </div>
        ) : (
          <div>
            {messages.map((msg) => {
              const isMine = msg.sender?._id === user._id;
              const isSeen = msg.seenBy?.some((id) => id === otherParticipant?._id);
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isMine={isMine}
                  isSeen={isSeen}
                />
              );
            })}

            {otherUserTyping && (
              <div className="flex items-center gap-2 text-xs text-orbit-primary font-medium italic mb-2 animate-pulse">
                <span>{otherParticipant?.name} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Image Preview Banner */}
      {imagePreview && (
        <div className="p-3 border-t border-orbit-border bg-white flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-orbit-border bg-orange-50">
            <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-orbit-textMuted">Ready to send photo</span>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-orbit-border bg-white flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-orbit-textMuted hover:text-orbit-primary hover:bg-orange-50 rounded-xl transition-colors"
          title="Share photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder={`Message @${otherParticipant?.username}...`}
          className="flex-1 bg-orange-50/60 border border-orbit-border rounded-xl px-4 py-2.5 text-sm text-orbit-text placeholder:text-orbit-textMuted focus:outline-none focus:ring-1 focus:ring-orbit-primary"
        />

        <button
          type="submit"
          disabled={(!text.trim() && !imageFile) || sending}
          className="btn-orbit-gradient p-2.5 rounded-xl text-white shadow-warm disabled:opacity-40 transition-all"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
