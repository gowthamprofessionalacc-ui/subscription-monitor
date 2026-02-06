'use client';

import React from 'react';
import { Notification } from '@/types';
import { OttIcon } from '@/components/ui/OttIcon';
import { Button } from '@/components/ui/Button';
import { getTheme } from '@/lib/ottThemes';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface NotificationCardProps {
  notification: Notification;
  onRespond: (id: number, response: 'yes' | 'no') => void;
  isLoading?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRespond,
  isLoading = false
}) => {
  const ottName = notification.subscriptions?.name || 'Custom';
  const theme = getTheme(ottName);
  const hasResponded = notification.response !== null;
  
  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  
  return (
    <div
      className={`rounded-xl border transition-all ${
        notification.is_read
          ? 'bg-gray-800/30 border-gray-800'
          : 'bg-gray-800/50 border-gray-700'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <OttIcon
            name={ottName}
            iconName={theme.iconName}
            primaryColor={theme.primaryColor}
            size={24}
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-white">{notification.title}</h3>
              <span className="text-xs text-gray-500">{timeAgo(notification.created_at)}</span>
            </div>
            
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
            
            {notification.notification_type === 'usage_check' && !hasResponded && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRespond(notification.id, 'yes')}
                  isLoading={isLoading}
                >
                  <FaCheck size={12} />
                  Yes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onRespond(notification.id, 'no')}
                  isLoading={isLoading}
                >
                  <FaTimes size={12} />
                  No
                </Button>
              </div>
            )}
            
            {hasResponded && (
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  notification.response === 'yes'
                    ? 'bg-green-500/20 text-green-400'
                    : notification.response === 'no'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  Responded: {notification.response}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
