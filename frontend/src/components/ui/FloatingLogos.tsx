'use client';

import React from 'react';
import { 
  SiNetflix, 
  SiSpotify, 
  SiYoutube, 
  SiApple,
  SiAmazonprime,
  SiHbo
} from 'react-icons/si';
import { FaPlaystation, FaXbox } from 'react-icons/fa';

const logos = [
  { Icon: SiNetflix, color: '#E50914', delay: '0s', position: { top: '8%', left: '8%' }, size: 48 },
  { Icon: SiSpotify, color: '#1DB954', delay: '1.2s', position: { top: '18%', right: '10%' }, size: 44 },
  { Icon: SiYoutube, color: '#FF0000', delay: '2.4s', position: { top: '55%', left: '6%' }, size: 52 },
  { Icon: SiApple, color: '#A2AAAD', delay: '0.6s', position: { top: '72%', right: '8%' }, size: 40 },
  { Icon: SiAmazonprime, color: '#00A8E1', delay: '1.8s', position: { top: '38%', left: '4%' }, size: 46 },
  { Icon: SiHbo, color: '#B000E5', delay: '3s', position: { top: '85%', left: '18%' }, size: 42 },
  { Icon: FaPlaystation, color: '#003791', delay: '0.9s', position: { top: '28%', right: '6%' }, size: 40 },
  { Icon: FaXbox, color: '#107C10', delay: '2.1s', position: { top: '50%', right: '8%' }, size: 44 },
  { Icon: SiNetflix, color: '#E50914', delay: '1.5s', position: { bottom: '18%', right: '22%' }, size: 36 },
  { Icon: SiSpotify, color: '#1DB954', delay: '2.7s', position: { bottom: '32%', left: '14%' }, size: 38 },
];

export const FloatingLogos: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {logos.map((logo, index) => {
        const { Icon, color, delay, position, size } = logo;
        const animationClass = index % 3 === 0 
          ? 'animate-float' 
          : index % 3 === 1 
          ? 'animate-float-reverse' 
          : 'animate-float-slow';
        
        return (
          <div
            key={index}
            className={`absolute ${animationClass}`}
            style={{
              ...position,
              animationDelay: delay,
              opacity: 0.55,
            }}
          >
            <Icon size={size} color={color} />
          </div>
        );
      })}
      
      {/* Gradient orbs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.35) 0%, transparent 70%)',
          top: '-15%',
          right: '-15%',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.35) 0%, transparent 70%)',
          bottom: '5%',
          left: '-10%',
          animationDelay: '1.5s',
        }}
      />
      <div 
        className="absolute w-[300px] h-[300px] rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.3) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          animationDelay: '3s',
        }}
      />
    </div>
  );
};

export default FloatingLogos;
