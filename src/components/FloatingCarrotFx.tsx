'use client';

import React from 'react';
import { CarrotFloatingText } from '@/lib/game/types';

interface FloatingCarrotFxProps {
  items: CarrotFloatingText[];
}

export const FloatingCarrotFx: React.FC<FloatingCarrotFxProps> = ({ items }) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute flex items-center gap-1 font-black text-xl md:text-2xl drop-shadow-md select-none animate-float-pop ${
            item.isGolden
              ? 'text-amber-300 font-extrabold tracking-wide drop-shadow-[0_2px_8px_rgba(255,215,0,0.8)]'
              : 'text-orange-500 font-bold'
          }`}
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span>{item.isGolden ? '✨' : '🥕'}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
};
