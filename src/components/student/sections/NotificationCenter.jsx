// src/components/student/sections/NotificationCenter.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';

const NotificationCenter = ({ notifications, user }) => {
  const [filter, setFilter] = useState('all');

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    let filtered = [...notifications].sort((a, b) =>
      (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.readBy?.includes(user?.uid));
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.readBy?.includes(user?.uid));
    }

    return filtered;
  }, [notifications, filter, user]);

  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(n => !n.readBy?.includes(user?.uid)).length;
  }, [notifications, user]);

  const handleMarkRead = useCallback(async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        readBy: arrayUnion(user?.uid)
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [user]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const unread = notifications.filter(n => !n.readBy?.includes(user?.uid));
      await Promise.all(
        unread.map(n =>
          updateDoc(doc(db, 'notifications', n.id), {
            readBy: arrayUnion(user?.uid)
          })
        )
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [notifications, user]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'info': return '💡';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'announcement': return '📢';
      case 'update': return '🔄';
      default: return '🔔';
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="No Notifications"
        description="You're all caught up! Notifications will appear here."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {sortedNotifications.map(notification => {
          const isRead = notification.readBy?.includes(user?.uid);
          return (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
              onClick={() => !isRead && handleMarkRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-medium ${!isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notification.title}
                    </p>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notification.message || notification.body}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {sortedNotifications.length === 0 && (
        <EmptyState
          icon="📭"
          title={filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
          description={filter === 'unread' ? 'No unread notifications' : 'No notifications to show'}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
