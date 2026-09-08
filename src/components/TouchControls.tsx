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

  const padBg = 'bg-[rgba(14,8,32,0.55)] tc-frosted border border-white/5';
  const keyBtn = 'w-14 h-14 min-w-[56px] min-h-[56px] bg-[rgba(14,8,32,0.42)] tc-frosted text-white rounded-[14px] flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.4)] active:translate-y-[1px] active:scale-[.96] active:shadow-none border border-white/10 transition-all duration-200 ease-[cubic-bezier(.2,.7,.2,1)] active:duration-[90ms] active:ease-out cursor-pointer';

  // Only render split controls on smaller screens (< md), hidden on desktop
  return (
    <div className="lg:hidden fixed bottom-3 left-0 right-0 px-3.5 pb-safe flex justify-between items-end pointer-events-none z-30 select-none touch-control-surface">
      {/* Left Thumb: Steering (Left / Right) */}
      <div className={`pointer-events-auto flex items-center gap-2.5 p-2 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${padBg}`}>
        <button
          onTouchStart={(e) => handleTouch('left', e)}
          onClick={(e) => handleTouch('left', e)}
          aria-label="Move Left"
          className={keyBtn}
        >
          <ArrowLeft className="w-7 h-7 stroke-[3] text-white" />
        </button>
        <button
          onTouchStart={(e) => handleTouch('right', e)}
          onClick={(e) => handleTouch('right', e)}
          aria-label="Move Right"
          className={keyBtn}
        >
          <ArrowRight className="w-7 h-7 stroke-[3] text-white" />
        </button>
      </div>

      {/* Right Thumb: Primary HOP & Down */}
      <div className={`pointer-events-auto flex flex-col items-center gap-2 p-2 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${padBg}`}>
        <button
          onTouchStart={(e) => handleTouch('up', e)}
          onClick={(e) => handleTouch('up', e)}
          aria-label="Hop Forward"
          className="w-20 h-16 min-w-[56px] min-h-[56px] bg-[linear-gradient(180deg,#fbc7f4,#f7a4ef_46%,#e474db)] active:brightness-95 text-[#4a1560] rounded-[14px] flex flex-col items-center justify-center shadow-[0_5px_0_rgba(120,40,140,.45)] active:translate-y-[1px] active:scale-[.96] active:shadow-none transition-all duration-200 ease-[cubic-bezier(.2,.7,.2,1)] active:duration-[90ms] active:ease-out border border-white/30 cursor-pointer"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[10px] font-black uppercase tracking-wider">HOP</span>
        </button>
        <button
          onTouchStart={(e) => handleTouch('down', e)}
          onClick={(e) => handleTouch('down', e)}
          aria-label="Step Back"
          className="w-14 h-10 min-w-[56px] bg-[rgba(14,8,32,0.42)] tc-frosted text-white/90 rounded-[14px] flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-[1px] active:scale-[.96] active:shadow-none border border-white/10 transition-all duration-200 ease-[cubic-bezier(.2,.7,.2,1)] active:duration-[90ms] active:ease-out cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
