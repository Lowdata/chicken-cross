'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/game/haptics';

export type TouchControlMode = 'split';
export type DPadPosition = 'center';

interface TouchControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  mode?: TouchControlMode;
  dpadPosition?: DPadPosition;
  onCyclePosition?: () => void;
  onCycleMode?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onMove }) => {
  const handleTouch = (dir: 'up' | 'down' | 'left' | 'right', e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic('hop');
    onMove(dir);
  };

  // Only render split controls on smaller screens (< md), hidden on desktop
  return (
    <div className="lg:hidden fixed bottom-3 left-0 right-0 px-3.5 pb-safe flex justify-between items-end pointer-events-none z-30 select-none touch-control-surface">
      {/* Left Thumb: Steering (Left / Right) */}
      <div className="pointer-events-auto flex items-center gap-2.5 p-2 bg-[#1B1035]/85 backdrop-blur-xl rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <button
          onTouchStart={(e) => handleTouch('left', e)}
          onClick={(e) => handleTouch('left', e)}
          aria-label="Move Left"
          className="w-14 h-14 bg-[#28184C] hover:bg-white/15 active:bg-brand-pink/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none border border-white/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7 stroke-[3] text-white" />
        </button>
        <button
          onTouchStart={(e) => handleTouch('right', e)}
          onClick={(e) => handleTouch('right', e)}
          aria-label="Move Right"
          className="w-14 h-14 bg-[#28184C] hover:bg-white/15 active:bg-brand-pink/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-none border border-white/20 transition-all cursor-pointer"
        >
          <ArrowRight className="w-7 h-7 stroke-[3] text-white" />
        </button>
      </div>

      {/* Right Thumb: Primary HOP & Down */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 p-2 bg-[#1B1035]/85 backdrop-blur-xl rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <button
          onTouchStart={(e) => handleTouch('up', e)}
          onClick={(e) => handleTouch('up', e)}
          aria-label="Hop Forward"
          className="w-20 h-16 bg-gradient-to-br from-brand-pink to-purple-600 active:from-brand-pink-dark active:to-purple-800 text-white rounded-2xl flex flex-col items-center justify-center shadow-[0_5px_0_#4C1D95] active:translate-y-1 active:shadow-none transition-all border border-white/30 cursor-pointer"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[10px] font-black uppercase tracking-wider">HOP</span>
        </button>
        <button
          onTouchStart={(e) => handleTouch('down', e)}
          onClick={(e) => handleTouch('down', e)}
          aria-label="Step Back"
          className="w-14 h-10 bg-[#28184C] hover:bg-white/15 active:bg-white/25 text-white/90 rounded-xl flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none border border-white/15 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
