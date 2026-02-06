'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBell, FaUser, FaPlus } from 'react-icons/fa';
import { useNotificationStore } from '@/store/notificationStore';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { unreadCount } = useNotificationStore();
  
  const navItems = [
    { href: '/dashboard', icon: FaHome, label: 'Home' },
    { href: '/add', icon: FaPlus, label: 'Add' },
    { href: '/notifications', icon: FaBell, label: 'Alerts', badge: unreadCount },
    { href: '/profile', icon: FaUser, label: 'Profile' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive 
                    ? 'text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className="relative">
                  <Icon size={22} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-gray-900" />
    </nav>
  );
};

export default BottomNav;
