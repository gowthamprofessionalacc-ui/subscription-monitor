'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Subscription } from '@/types';
import { OttIcon } from '@/components/ui/OttIcon';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { getTheme } from '@/lib/ottThemes';

interface SubscriptionCardProps {
  subscription: Subscription;
  compact?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, compact = false }) => {
  const router = useRouter();
  const theme = subscription.theme || getTheme(subscription.name);
  const state = subscription.subscription_state;
  
  if (compact) {
    return (
      <button
        onClick={() => router.push(`/subscription/${subscription.id}`)}
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-left w-full"
        style={{
          background: theme.gradient,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative p-4 flex flex-col items-center text-center">
          <OttIcon
            name={subscription.name}
            iconName={theme.iconName}
            primaryColor="#FFFFFF"
            size={36}
          />
          <h3 className="font-bold text-white text-sm mt-2 truncate w-full">{subscription.name}</h3>
          <p className="text-white/70 text-xs mt-1">
            ₹{state?.monthly_cost || subscription.amount}/mo
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => router.push(`/subscription/${subscription.id}`)}
      className="relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: theme.gradient,
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <OttIcon
              name={subscription.name}
              iconName={theme.iconName}
              primaryColor="#FFFFFF"
              size={32}
            />
            <div>
              <h3 className="font-bold text-white text-lg">{subscription.name}</h3>
              <p className="text-white/70 text-sm">
                ₹{state?.monthly_cost || subscription.amount}/month
              </p>
            </div>
          </div>
          
          {state && (
            <RiskBadge level={state.risk_level} size="sm" />
          )}
        </div>
        
        {state && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-white/60">Unused</span>
                <p className="text-white font-semibold">{state.days_unused} days</p>
              </div>
              <div>
                <span className="text-white/60">Usage</span>
                <p className="text-white font-semibold">{state.usage_confidence}%</p>
              </div>
            </div>
            
            {state.intentional_keep && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                Intentional
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
