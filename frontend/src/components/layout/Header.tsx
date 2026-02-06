'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightElement,
  style
}) => {
  const router = useRouter();
  
  return (
    <header 
      className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800"
      style={style}
    >
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FaArrowLeft size={18} className="text-gray-300" />
            </button>
          )}
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        {rightElement && (
          <div>{rightElement}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
