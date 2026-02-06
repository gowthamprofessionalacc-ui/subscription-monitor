// Zustand Store for Subscription State
import { create } from 'zustand';
import { Subscription, DashboardSummary, OttCatalog } from '@/types';

interface SubscriptionState {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  dashboard: DashboardSummary | null;
  ottCatalog: OttCatalog[];
  isLoading: boolean;
  error: string | null;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setSelectedSubscription: (subscription: Subscription | null) => void;
  setDashboard: (dashboard: DashboardSummary | null) => void;
  setOttCatalog: (catalog: OttCatalog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: number, updates: Partial<Subscription>) => void;
  removeSubscription: (id: number) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  selectedSubscription: null,
  dashboard: null,
  ottCatalog: [],
  isLoading: false,
  error: null,
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setSelectedSubscription: (selectedSubscription) => set({ selectedSubscription }),
  setDashboard: (dashboard) => set({ dashboard }),
  setOttCatalog: (ottCatalog) => set({ ottCatalog }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
  updateSubscription: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),
  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}));
