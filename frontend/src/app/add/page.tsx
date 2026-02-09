'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OttSelector } from '@/components/subscription/OttSelector';
import { FloatingLogos } from '@/components/ui/FloatingLogos';
import { OttCatalog } from '@/types';
import { FaPlus, FaQuestionCircle, FaTimes, FaCalendar, FaRupeeSign } from 'react-icons/fa';

// Mock OTT catalog data
const MOCK_OTT_CATALOG: OttCatalog[] = [
  { id: 1, name: 'Netflix', icon_name: 'netflix', primary_color: '#E50914', secondary_color: '#141414', category: 'streaming', default_amount: 199, default_billing_cycle: 'monthly', created_at: '' },
  { id: 2, name: 'Amazon Prime Video', icon_name: 'amazonprime', primary_color: '#00A8E1', secondary_color: '#232F3E', category: 'streaming', default_amount: 179, default_billing_cycle: 'monthly', created_at: '' },
  { id: 3, name: 'Disney+ Hotstar', icon_name: 'hotstar', primary_color: '#0063E5', secondary_color: '#1A1D29', category: 'streaming', default_amount: 299, default_billing_cycle: 'monthly', created_at: '' },
  { id: 4, name: 'Spotify', icon_name: 'spotify', primary_color: '#1DB954', secondary_color: '#191414', category: 'music', default_amount: 119, default_billing_cycle: 'monthly', created_at: '' },
  { id: 5, name: 'YouTube Premium', icon_name: 'youtube', primary_color: '#FF0000', secondary_color: '#282828', category: 'streaming', default_amount: 129, default_billing_cycle: 'monthly', created_at: '' },
  { id: 6, name: 'Apple TV+', icon_name: 'appletv', primary_color: '#000000', secondary_color: '#FFFFFF', category: 'streaming', default_amount: 99, default_billing_cycle: 'monthly', created_at: '' },
  { id: 7, name: 'HBO Max', icon_name: 'hbo', primary_color: '#B000E5', secondary_color: '#000000', category: 'streaming', default_amount: 299, default_billing_cycle: 'monthly', created_at: '' },
  { id: 8, name: 'Crunchyroll', icon_name: 'crunchyroll', primary_color: '#F47521', secondary_color: '#000000', category: 'streaming', default_amount: 79, default_billing_cycle: 'monthly', created_at: '' },
  { id: 9, name: 'JioCinema', icon_name: null, primary_color: '#E50064', secondary_color: '#1A1A2E', category: 'streaming', default_amount: 89, default_billing_cycle: 'monthly', created_at: '' },
];

const helpGuides = [
  {
    title: 'How to find Start Date',
    content: 'Go to your OTT app → Settings → Subscription/Billing → Look for "Member since" or "Subscription started"',
    platforms: ['Netflix: Profile → Account → Billing details', 'Prime: Account → Prime Membership → See renewal date', 'Spotify: Account → Subscription → See billing date'],
  },
  {
    title: 'How to find Renewal Date',
    content: 'Usually found in the billing or subscription section of your OTT app.',
    platforms: ['Netflix: Account → Billing details → Next billing date', 'Hotstar: Profile → Manage Subscription', 'YouTube: Settings → Purchases and memberships'],
  },
];

export default function AddSubscriptionPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const { ottCatalog, setOttCatalog, subscriptions, addSubscription } = useSubscriptionStore();
  
  const [selectedOtt, setSelectedOtt] = useState<OttCatalog | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [sharedCount, setSharedCount] = useState('1');
  const [isCritical, setIsCritical] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isFirstTime = subscriptions.length === 0;
  
  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login');
      return;
    }

    // Fetch OTT catalog from API
    const fetchCatalog = async () => {
      try {
        const data = await api.getOttCatalog(token) as OttCatalog[];
        setOttCatalog(data);
      } catch (err) {
        console.error('Error fetching catalog:', err);
        // Fallback to mock data if API fails
        setOttCatalog(MOCK_OTT_CATALOG);
      }
    };

    if (ottCatalog.length === 0) {
      fetchCatalog();
    }
  }, [isAuthenticated, token, router, ottCatalog.length, setOttCatalog]);

  const handleOttSelect = (ott: OttCatalog | null) => {
    setSelectedOtt(ott);
    if (ott) {
      setName(ott.name);
      setAmount(ott.default_amount.toString());
      setBillingCycle(ott.default_billing_cycle);
      setShowForm(true);
    } else {
      setName('');
      setAmount('');
      setShowForm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !amount || !startDate) {
      setError('Please fill all required fields');
      return;
    }

    // Validate start date is not in the future
    const selectedStartDate = new Date(startDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    if (selectedStartDate > todayDate) {
      setError('Start date cannot be in the future');
      return;
    }

    setIsLoading(true);

    try {
      const subscription = await api.createSubscription(token!, {
        ott_catalog_id: selectedOtt?.id,
        name,
        category: selectedOtt?.category || 'other',
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        auto_renew: autoRenew,
        start_date: startDate,
        renewal_date: renewalDate || undefined,
        is_shared: isShared,
        shared_members_count: parseInt(sharedCount),
        is_critical: isCritical,
      });
      
      addSubscription(subscription as any);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial "Add Subscription" screen for first-time users
  if (!showForm && isFirstTime) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <FloatingLogos />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center animate-fadeIn">
            {/* Large Add Icon */}
            <button
              onClick={() => setShowForm(true)}
              className="w-32 h-32 mx-auto mb-8 rounded-full btn-gradient flex items-center justify-center shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform"
            >
              <FaPlus className="text-white text-5xl" />
            </button>
            
            <h1 className="text-2xl font-bold text-white mb-3">Add Your First Subscription</h1>
            <p className="text-gray-400 max-w-xs mx-auto">
              Add your OTT details so I can help you save money by tracking unused subscriptions
            </p>
            
            <Button
              variant="gradient"
              className="mt-8"
              onClick={() => setShowForm(true)}
            >
              <FaPlus /> Get Started
            </Button>
          </div>
        </div>

        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-lg z-50"
        >
          <FaQuestionCircle className="text-white text-2xl" />
        </button>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-light rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Help Guide</h2>
                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
                  <FaTimes size={20} />
                </button>
              </div>
              
              {helpGuides.map((guide, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="font-semibold text-indigo-400 mb-2">{guide.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{guide.content}</p>
                  <div className="space-y-1">
                    {guide.platforms.map((platform, i) => (
                      <p key={i} className="text-gray-400 text-xs">• {platform}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <MainLayout>
      <Header title="Add Subscription" showBack />
      
      <div className="px-4 py-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTT Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select OTT Platform
            </label>
            <OttSelector
              catalog={ottCatalog.length > 0 ? ottCatalog : MOCK_OTT_CATALOG}
              selectedId={selectedOtt?.id || null}
              onSelect={handleOttSelect}
            />
          </div>

          {/* Custom Name */}
          <Input
            label="Subscription Name *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Netflix, Spotify"
            required
          />

          {/* Amount */}
          <Input
            label="Monthly Cost (₹) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            icon={<FaRupeeSign className="text-gray-500" />}
            required
          />

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              required
            />
            <Input
              label="Renewal Date"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Billing Cycle
            </label>
            <div className="flex gap-2">
              {['monthly', 'quarterly', 'yearly'].map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    billingCycle === cycle
                      ? 'btn-gradient text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-300">Auto-renew enabled</span>
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
              <span className="text-gray-300">Shared subscription</span>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
            
            {isShared && (
              <Input
                label="Number of members sharing"
                type="number"
                value={sharedCount}
                onChange={(e) => setSharedCount(e.target.value)}
                min="2"
              />
            )}
            
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50">
              <div>
                <span className="text-gray-300">Critical service</span>
                <p className="text-gray-500 text-xs">Won&apos;t flag as high risk</p>
              </div>
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          <Button type="submit" variant="gradient" className="w-full" isLoading={isLoading}>
            Add Subscription
          </Button>
        </form>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-lg z-40"
      >
        <FaQuestionCircle className="text-white text-2xl" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-light rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Help Guide</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            
            {helpGuides.map((guide, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="font-semibold text-indigo-400 mb-2">{guide.title}</h3>
                <p className="text-gray-300 text-sm mb-3">{guide.content}</p>
                <div className="space-y-1">
                  {guide.platforms.map((platform, i) => (
                    <p key={i} className="text-gray-400 text-xs">• {platform}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
