'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  onClick
}) => {
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 ${
        onClick ? 'cursor-pointer hover:border-gray-600 transition-all' : ''
      } ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
