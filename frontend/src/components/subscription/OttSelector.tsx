'use client';

import React from 'react';
import { OttCatalog } from '@/types';
import { OttIcon } from '@/components/ui/OttIcon';
import { getTheme } from '@/lib/ottThemes';

interface OttSelectorProps {
  catalog: OttCatalog[];
  selectedId: number | null;
  onSelect: (ott: OttCatalog | null) => void;
}

export const OttSelector: React.FC<OttSelectorProps> = ({
  catalog,
  selectedId,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {catalog.map((ott) => {
        const theme = ott.theme || getTheme(ott.name);
        const isSelected = selectedId === ott.id;
        
        return (
          <button
            key={ott.id}
            onClick={() => onSelect(isSelected ? null : ott)}
            className={`relative flex flex-col items-center p-3 rounded-xl transition-all overflow-hidden ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                : 'hover:scale-105'
            }`}
            style={{
              background: isSelected ? theme.gradient : 'rgba(31, 41, 55, 0.5)',
              ringColor: theme.primaryColor,
            }}
          >
            <OttIcon
              name={ott.name}
              iconName={theme.iconName}
              primaryColor={isSelected ? '#FFFFFF' : theme.primaryColor}
              size={28}
            />
            <span className={`mt-2 text-xs text-center truncate w-full ${
              isSelected ? 'text-white font-medium' : 'text-gray-300'
            }`}>
              {ott.name}
            </span>
            {ott.default_amount > 0 && (
              <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                ₹{ott.default_amount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OttSelector;
