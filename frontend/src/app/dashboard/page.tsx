'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNotificationStore } from '@/store/notificationStore';
import { FloatingLogos } from '@/components/ui/FloatingLogos';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { DashboardSummary, Subscription } from '@/types';
import { FaPlus } from 'react-icons/fa';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const { subscriptions, setSubscriptions, dashboard, setDashboard } = useSubscriptionStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [subsData, dashData, unreadData] = await Promise.all([
          api.getSubscriptions(token) as Promise<Subscription[]>,
          api.getDashboard(token) as Promise<DashboardSummary>,
          api.getUnreadCount(token) as Promise<{ count: number }>,
        ]);
        
        setSubscriptions(subsData);
        setDashboard(dashData);
        setUnreadCount(unreadData.count);
        
        // If no subscriptions, redirect to add page
        if (subsData.length === 0) {
          router.replace('/add');
          return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, router, setSubscriptions, setDashboard, setUnreadCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <FloatingLogos />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-light border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left - empty for balance */}
          <div className="w-10" />
          
          {/* Center - User Name */}
          <h1 className="text-xl font-bold text-gradient">
            {user?.name || 'Dashboard'}
          </h1>
          
          {/* Right - Profile Avatar */}
          <button 
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : user?.email ? (
              <span>{user.email.charAt(0).toUpperCase()}</span>
            ) : (
              <span>U</span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Subscriptions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Subscriptions</h2>
            <span className="text-sm text-gray-400">{subscriptions.length} active</span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="glass-light rounded-2xl p-8 text-center">
              <p className="text-gray-400 mb-4">No subscriptions yet</p>
              <button
                onClick={() => router.push('/add')}
                className="text-gradient font-medium hover:underline"
              >
                Add your first subscription
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} compact />
              ))}
            </div>
          )}

          {/* Add More Button */}
          {subscriptions.length > 0 && (
            <button
              onClick={() => router.push('/add')}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              <FaPlus /> Add Subscription
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {dashboard && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="glass-light rounded-2xl p-4">
              <p className="text-gray-400 text-sm">Monthly Spend</p>
              <p className="text-2xl font-bold text-white">₹{dashboard.totalMonthlyCost}</p>
            </div>
            <div className="glass-light rounded-2xl p-4">
              <p className="text-gray-400 text-sm">Money Wasted</p>
              <p className="text-2xl font-bold text-red-400">₹{dashboard.totalWasted}</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => router.push('/notifications')}
          className="relative w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-2xl shadow-indigo-500/30"
        >
          <span className="text-white text-xl font-bold">N</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
