'use client';

import React from 'react';
import { BottomNav } from './BottomNav';
import { FloatingLogos } from '@/components/ui/FloatingLogos';

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  hideFloatingLogos?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, hideNav = false, hideFloatingLogos = false }) => {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {!hideFloatingLogos && <FloatingLogos />}
      <main className={`relative z-10 max-w-lg mx-auto ${!hideNav ? 'pb-24' : ''}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
