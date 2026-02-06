'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { FloatingLogos } from '@/components/ui/FloatingLogos';
import { OttIcon } from '@/components/ui/OttIcon';
import { Button } from '@/components/ui/Button';
import { getTheme } from '@/lib/ottThemes';
import { Notification } from '@/types';
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaCheck, FaTimes, FaSave } from 'react-icons/fa';

export default function NotificationsPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const { notifications, setNotifications, updateNotification, setUnreadCount } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingResponses, setPendingResponses] = useState<Record<number, 'yes' | 'no'>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications(token) as Notification[];
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, token, router, setNotifications]);

  const handleRespond = (id: number, response: 'yes' | 'no') => {
    setPendingResponses(prev => ({ ...prev, [id]: response }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Send all pending responses to API
      await Promise.all(
        Object.entries(pendingResponses).map(([id, response]) =>
          api.respondToNotification(token!, parseInt(id), response)
        )
      );
      
      // Update notifications in store
      Object.entries(pendingResponses).forEach(([id, response]) => {
        updateNotification(parseInt(id), { 
          response, 
          is_read: true,
          responded_at: new Date().toISOString() 
        });
      });
      
      // Update unread count
      const unreadData = await api.getUnreadCount(token!) as { count: number };
      setUnreadCount(unreadData.count);
      
      setPendingResponses({});
    } catch (error) {
      console.error('Error saving responses:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasPendingResponses = Object.keys(pendingResponses).length > 0;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <FloatingLogos />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-light border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaArrowLeft size={18} className="text-gray-300" />
          </button>
          
          <h1 className="text-xl font-bold text-gradient">Notifications</h1>
          
          {/* Profile Avatar */}
          <button 
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden"
          >
            {user?.email ? (
              <span>{user.email.charAt(0).toUpperCase()}</span>
            ) : (
              <span>U</span>
            )}
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const ottName = notification.subscriptions?.name || 'Custom';
              const theme = getTheme(ottName);
              const isExpanded = expandedId === notification.id;
              const pendingResponse = pendingResponses[notification.id];
              const hasResponded = notification.response !== null || pendingResponse;
              
              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl overflow-hidden transition-all ${
                    notification.is_read && !pendingResponse
                      ? 'bg-gray-800/30 border border-gray-800'
                      : 'glass-light'
                  }`}
                >
                  {/* Header - Always visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <OttIcon
                        name={ottName}
                        iconName={theme.iconName}
                        primaryColor={theme.primaryColor}
                        size={32}
                      />
                      <div className="text-left">
                        <h3 className="font-semibold text-white">{ottName}</h3>
                        <p className="text-xs text-gray-500">{timeAgo(notification.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(notification.response || pendingResponse) && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          (notification.response || pendingResponse) === 'yes'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {(notification.response || pendingResponse) === 'yes' ? 'Yes' : 'No'}
                        </span>
                      )}
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fadeIn">
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-300 mb-4">{notification.message}</p>
                        
                        {notification.notification_type === 'usage_check' && !notification.response && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRespond(notification.id, 'yes')}
                              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                pendingResponse === 'yes'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <FaCheck size={14} />
                              Yes
                            </button>
                            <button
                              onClick={() => handleRespond(notification.id, 'no')}
                              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                pendingResponse === 'no'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <FaTimes size={14} />
                              No
                            </button>
                          </div>
                        )}
                        
                        {notification.response && (
                          <p className="text-gray-500 text-sm">
                            You responded: <span className={notification.response === 'yes' ? 'text-green-400' : 'text-red-400'}>{notification.response}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Save Button - Fixed at bottom when there are pending responses */}
      {hasPendingResponses && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto">
          <Button
            variant="gradient"
            className="w-full py-4"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <FaSave /> Save Responses
          </Button>
        </div>
      )}
    </div>
  );
}
