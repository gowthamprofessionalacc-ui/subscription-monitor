'use client';

import React from 'react';
import { 
  SiNetflix, 
  SiSpotify, 
  SiYoutube, 
  SiApple,
  SiCrunchyroll,
  SiAmazonprime,
  SiHbo
} from 'react-icons/si';
import { FaPlay, FaMusic, FaGamepad, FaTv, FaXbox, FaPlaystation, FaStar } from 'react-icons/fa';

interface OttIconProps {
  name: string;
  iconName: string | null;
  primaryColor: string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'netflix': SiNetflix,
  'spotify': SiSpotify,
  'youtube': SiYoutube,
  'appletv': SiApple,
  'applemusic': SiApple,
  'crunchyroll': SiCrunchyroll,
  'amazonprime': SiAmazonprime,
  'amazonmusic': SiAmazonprime,
  'hbo': SiHbo,
  'hotstar': FaStar,
  'xbox': FaXbox,
  'playstation': FaPlaystation,
};

const categoryIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'streaming': FaTv,
  'music': FaMusic,
  'gaming': FaGamepad,
  'other': FaPlay,
};

export const OttIcon: React.FC<OttIconProps> = ({ 
  name, 
  iconName, 
  primaryColor, 
  size = 24,
  className = ''
}) => {
  // Try to get icon from icon map
  if (iconName && iconMap[iconName]) {
    const IconComponent = iconMap[iconName];
    return <IconComponent size={size} color={primaryColor} />;
  }
  
  // Fallback to styled text logo
  return (
    <div 
      className={`flex items-center justify-center font-bold rounded-lg ${className}`}
      style={{ 
        backgroundColor: primaryColor,
        width: size + 8,
        height: size + 8,
        fontSize: size * 0.4,
        color: '#FFFFFF'
      }}
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

export const CategoryIcon: React.FC<{ category: string; size?: number; color?: string }> = ({
  category,
  size = 20,
  color = '#FFFFFF'
}) => {
  const IconComponent = categoryIcons[category] || categoryIcons['other'];
  return <IconComponent size={size} color={color} />;
};

export default OttIcon;
