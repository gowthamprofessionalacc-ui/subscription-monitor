'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { OttIcon } from '@/components/ui/OttIcon';
import { getTheme } from '@/lib/ottThemes';
import { Subscription } from '@/types';
import { FaCalendar, FaRupeeSign, FaTrash, FaHeart, FaArrowLeft, FaBell, FaTimes } from 'react-icons/fa';

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { subscriptions, updateSubscription, removeSubscription } = useSubscriptionStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingKeep, setIsTogglingKeep] = useState(false);
  const [showRenewalPopup, setShowRenewalPopup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login');
      return;
    }

    // Try to find subscription from store first
    const sub = subscriptions.find(s => s.id === parseInt(id));
    if (sub) {
      setSubscription(sub);
      setIsLoading(false);
    } else {
      // Fetch from API if not in store
      const fetchSubscription = async () => {
        try {
          const data = await api.getSubscription(token, parseInt(id)) as Subscription;
          setSubscription(data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          router.push('/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubscription();
    }
  }, [isAuthenticated, token, id, router, subscriptions]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    setIsDeleting(true);
    try {
      await api.deleteSubscription(token!, parseInt(id));
      removeSubscription(parseInt(id));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setIsDeleting(false);
    }
  };

  const handleToggleIntentionalKeep = async () => {
    if (!subscription) return;
    
    setIsTogglingKeep(true);
    try {
      const newValue = !subscription.subscription_state?.intentional_keep;
      await api.setIntentionalKeep(token!, parseInt(id), newValue);
      
      const updatedSub = {
        ...subscription,
        subscription_state: {
          ...subscription.subscription_state!,
          intentional_keep: newValue,
        },
      };
      
      updateSubscription(parseInt(id), updatedSub);
      setSubscription(updatedSub);
    } catch (error) {
      console.error('Error toggling intentional keep:', error);
    } finally {
      setIsTogglingKeep(false);
    }
  };

  if (isLoading || !subscription) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const theme = subscription.theme || getTheme(subscription.name);
  const state = subscription.subscription_state;

  return (
    <div className="min-h-screen" style={{ background: theme.cardBackground }}>
      {/* Themed Header - Compact */}
      <div style={{ background: theme.gradient }}>
        <header className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FaArrowLeft size={16} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">{subscription.name}</h1>
          <div className="w-10" />
        </header>
        
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center justify-center flex-col">
            <OttIcon
              name={subscription.name}
              iconName={theme.iconName}
              primaryColor="#FFFFFF"
              size={48}
            />
            <p className="text-white/70 text-sm mt-1">{subscription.category}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3 -mt-4 relative z-10 pb-24">
        {/* Risk & Usage - Compact */}
        {state && (
          <Card className="flex items-center justify-around py-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="text-center">
              <ProgressRing
                value={state.usage_confidence}
                color={state.usage_confidence > 60 ? '#22C55E' : state.usage_confidence > 30 ? '#EAB308' : '#EF4444'}
                label="Usage"
              />
            </div>
            <div className="text-center">
              <RiskBadge level={state.risk_level} />
              <p className="text-xs text-gray-400 mt-1">Risk Level</p>
              <p className="text-xl font-bold text-white">{state.risk_score}</p>
            </div>
          </Card>
        )}

        {/* Analytics Section - Grid Layout for Mobile */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white text-sm">Analytics</h3>
          
          {state && (
            <>
              {/* Grid for mobile - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <Card style={{ background: 'rgba(0,0,0,0.4)' }} className="p-3">
                  <p className="text-gray-400 text-xs">Usage</p>
                  <p className="text-lg font-bold" style={{ color: theme.primaryColor }}>{state.usage_confidence}%</p>
                </Card>

                <Card style={{ background: 'rgba(0,0,0,0.4)' }} className="p-3">
                  <p className="text-gray-400 text-xs">Days Unused</p>
                  <p className="text-lg font-bold text-white">{state.days_unused}</p>
                </Card>

                <Card style={{ background: 'rgba(0,0,0,0.4)' }} className="p-3">
                  <p className="text-gray-400 text-xs">Monthly Cost</p>
                  <p className="text-lg font-bold text-white">₹{state.monthly_cost}</p>
                </Card>

                <Card style={{ background: 'rgba(0,0,0,0.4)' }} className="p-3">
                  <p className="text-gray-400 text-xs">Money Wasted</p>
                  <p className="text-lg font-bold text-red-400">₹{state.wasted_amount}</p>
                </Card>
              </div>

              {/* Yearly Projection - Full width */}
              {subscription.auto_renew && (
                <Card className="border border-yellow-500/30 p-3" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 text-xs font-medium">Yearly Projection</p>
                      <p className="text-xs text-gray-400">If auto-renew stays on</p>
                    </div>
                    <p className="text-xl font-bold text-yellow-400">₹{state.yearly_bleed}</p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Actions - Compact Side by Side */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={state?.intentional_keep ? 'secondary' : 'gradient'}
            className="flex-1"
            size="sm"
            onClick={handleToggleIntentionalKeep}
            isLoading={isTogglingKeep}
          >
            <FaHeart />
            {state?.intentional_keep ? 'Remove IK' : 'Intentional Keep'}
          </Button>
          
          <Button
            variant="danger"
            className="flex-1"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <FaTrash />
            Delete
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left - RD Button */}
          <button
            onClick={() => setShowRenewalPopup(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: theme.gradient }}
          >
            RD
          </button>
          
          {/* Center - Notification */}
          <button
            onClick={() => router.push('/notifications')}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <FaBell className="text-gray-300" size={20} />
          </button>
          
          {/* Right - IK Button */}
          <button
            onClick={handleToggleIntentionalKeep}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              state?.intentional_keep 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            IK
          </button>
        </div>
      </div>

      {/* Renewal Date Popup */}
      {showRenewalPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-light rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Renewal Details</h2>
              <button onClick={() => setShowRenewalPopup(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                <span className="text-gray-400 flex items-center gap-2">
                  <FaCalendar /> Renewal Date
                </span>
                <span className="text-white font-medium">
                  {subscription.renewal_date 
                    ? new Date(subscription.renewal_date).toLocaleDateString() 
                    : 'Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                <span className="text-gray-400 flex items-center gap-2">
                  <FaRupeeSign /> Monthly Cost
                </span>
                <span className="text-white font-medium">₹{state?.monthly_cost || subscription.amount}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                <span className="text-gray-400">Unused Duration</span>
                <span className="text-white font-medium">{state?.days_unused || 0} days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
                <span className="text-gray-400">Auto Renew</span>
                <span className={subscription.auto_renew ? 'text-green-400' : 'text-gray-500'}>
                  {subscription.auto_renew ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
