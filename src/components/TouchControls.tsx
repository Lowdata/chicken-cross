'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TouchControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onMove }) => {
  const handleTouch = (dir: 'up' | 'down' | 'left' | 'right', e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMove(dir);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-30 select-none touch-none sm:hidden">
      <div className="relative grid grid-cols-3 grid-rows-3 gap-2.5 w-52 h-52 pointer-events-auto p-2 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl">
        {/* UP */}
        <button
          onTouchStart={(e) => handleTouch('up', e)}
          onClick={(e) => handleTouch('up', e)}
          aria-label="Move Up"
          className="col-start-2 row-start-1 dpad-btn bg-white/80 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/90 active:scale-90 transition-all"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={(e) => handleTouch('left', e)}
          onClick={(e) => handleTouch('left', e)}
          aria-label="Move Left"
          className="col-start-1 row-start-2 dpad-btn bg-white/80 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/90 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-7 h-7 stroke-[3]" />
        </button>

        {/* CENTER ICON / BUNNY LOGO */}
        <div className="col-start-2 row-start-2 flex items-center justify-center opacity-40 text-2xl">
          🐰
        </div>

        {/* RIGHT */}
        <button
          onTouchStart={(e) => handleTouch('right', e)}
          onClick={(e) => handleTouch('right', e)}
          aria-label="Move Right"
          className="col-start-3 row-start-2 dpad-btn bg-white/80 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/90 active:scale-90 transition-all"
        >
          <ArrowRight className="w-7 h-7 stroke-[3]" />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={(e) => handleTouch('down', e)}
          onClick={(e) => handleTouch('down', e)}
          aria-label="Move Down"
          className="col-start-2 row-start-3 dpad-btn bg-white/80 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/90 active:scale-90 transition-all"
        >
          <ArrowDown className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
