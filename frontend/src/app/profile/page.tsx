'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { FloatingLogos } from '@/components/ui/FloatingLogos';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OttIcon } from '@/components/ui/OttIcon';
import { getTheme } from '@/lib/ottThemes';
import { FaEnvelope, FaPhone, FaSignOutAlt, FaCog, FaArrowLeft, FaPlus, FaTrash, FaEye, FaTimes } from 'react-icons/fa';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { subscriptions, removeSubscription } = useSubscriptionStore();
  const [budget, setBudget] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login');
      return;
    }
    
    if (user?.user_settings?.monthly_subscription_budget) {
      setBudget(user.user_settings.monthly_subscription_budget.toString());
    }
  }, [isAuthenticated, token, router, user]);

  const handleUpdateBudget = async () => {
    setIsUpdating(true);
    setMessage('');
    
    try {
      await api.updateSettings(token!, {
        monthly_subscription_budget: parseFloat(budget) || 0,
      });
      setMessage('Budget updated successfully!');
    } catch (error) {
      setMessage('Failed to update budget');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteSubscription = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    setDeletingId(id);
    try {
      await api.deleteSubscription(token!, id);
      removeSubscription(id);
    } catch (error) {
      console.error('Error deleting subscription:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

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
          
          <h1 className="text-xl font-bold text-gradient">Profile</h1>
          
          <div className="w-10" />
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* User Info Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {user.email ? user.email.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex items-center gap-3 text-gray-400">
              <FaEnvelope />
              <span>{user.email}</span>
            </div>
            {user.phone_number && (
              <div className="flex items-center gap-3 text-gray-400">
                <FaPhone />
                <span>{user.phone_number}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowSubscriptions(true)}
            className="glass-light rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
          >
            <FaEye className="text-indigo-400" size={20} />
            <span className="text-xs text-gray-300">View OTT</span>
          </button>
          <button
            onClick={() => router.push('/add')}
            className="glass-light rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
          >
            <FaPlus className="text-green-400" size={20} />
            <span className="text-xs text-gray-300">Add New</span>
          </button>
          <button
            onClick={() => setShowSubscriptions(true)}
            className="glass-light rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all"
          >
            <FaTrash className="text-red-400" size={20} />
            <span className="text-xs text-gray-300">Delete</span>
          </button>
        </div>

        {/* Budget Settings */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FaCog className="text-gray-400" />
            <h3 className="font-semibold text-white">Budget Settings</h3>
          </div>
          
          <div className="space-y-3">
            <Input
              label="Monthly Subscription Budget (₹)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter your monthly budget"
            />
            
            {message && (
              <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
            
            <Button variant="gradient" onClick={handleUpdateBudget} isLoading={isUpdating}>
              Update Budget
            </Button>
          </div>
        </Card>

        {/* Account Info */}
        <Card>
          <h3 className="font-semibold text-white mb-3">Account</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Provider: {user.auth_provider === 'google' ? 'Google' : 'Email'}</p>
            <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          className="w-full"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Sign Out
        </Button>
      </main>

      {/* Subscriptions Modal */}
      {showSubscriptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-light rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Subscriptions</h2>
              <button onClick={() => setShowSubscriptions(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No subscriptions yet</p>
                <Button variant="gradient" onClick={() => { setShowSubscriptions(false); router.push('/add'); }}>
                  <FaPlus /> Add Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => {
                  const theme = getTheme(sub.name);
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <OttIcon
                          name={sub.name}
                          iconName={theme.iconName}
                          primaryColor={theme.primaryColor}
                          size={28}
                        />
                        <div>
                          <p className="text-white font-medium">{sub.name}</p>
                          <p className="text-gray-400 text-xs">₹{sub.amount}/month</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setShowSubscriptions(false); router.push(`/subscription/${sub.id}`); }}
                          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          disabled={deletingId === sub.id}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          {deletingId === sub.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaTrash size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
