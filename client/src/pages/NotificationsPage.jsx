import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification
} from '../api/notification.api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { NotificationItem } from '../components/notification/NotificationItem.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Button } from '../components/common/Button.jsx';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const { clearUnreadNotifications, decrementNotificationCount } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const res = await getNotifications(1, 20);
        setNotifications(res.data.notifications || []);
        setHasMore(res.data.page < res.data.totalPages);
        setPage(1);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markNotificationAsRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      clearUnreadNotifications();
      showToast('All notifications marked as read');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      decrementNotificationCount();
    } catch (err) {
      // Ignore
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast('Notification deleted');
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orbit-soft flex items-center justify-center text-orbit-primary">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-orbit-text tracking-tight">
              Notifications
            </h2>
            <p className="text-xs text-orbit-textMuted">
              Stay in the loop with what is happening around you
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            loading={markingAll}
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orbit-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When someone likes, comments, or follows you, you'll see it here in real-time!"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkSingleRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
};
