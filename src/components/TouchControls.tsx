'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft, Move } from 'lucide-react';
import { triggerHaptic } from '@/lib/game/haptics';

export type TouchControlMode = 'dpad' | 'split' | 'swipe';
export type DPadPosition = 'left' | 'center' | 'right';

interface TouchControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  mode?: TouchControlMode;
  dpadPosition?: DPadPosition;
  onCyclePosition?: () => void;
  onCycleMode?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  mode = 'dpad',
  dpadPosition = 'center',
  onCyclePosition,
  onCycleMode,
}) => {
  const handleTouch = (dir: 'up' | 'down' | 'left' | 'right', e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic('hop');
    onMove(dir);
  };

  // Swipe-Only Mode: Show minimal indicator with quick mode switcher
  if (mode === 'swipe') {
    return (
      <div className="fixed bottom-4 left-0 right-0 pb-safe flex justify-center pointer-events-none z-30 select-none touch-control-surface">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-auto shadow-lg text-white/80 text-xs font-bold">
          <span>👆 Swipe anywhere to Hop</span>
          {onCycleMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                onCycleMode();
              }}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-[11px] font-black text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider transition-all"
            >
              D-Pad
            </button>
          )}
        </div>
      </div>
    );
  }

  // Split-Thumb Mode: Left hand moves Left/Right, Right hand Hops Forward / Backward
  if (mode === 'split') {
    return (
      <div className="fixed bottom-3 left-0 right-0 px-3 pb-safe flex justify-between items-end pointer-events-none z-30 select-none touch-control-surface">
        {/* Left Thumb: Steering */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl">
          <button
            onTouchStart={(e) => handleTouch('left', e)}
            onClick={(e) => handleTouch('left', e)}
            aria-label="Move Left"
            className="w-14 h-14 dpad-btn bg-white/85 active:bg-amber-300 text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white/90 active:scale-90 transition-all"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>
          <button
            onTouchStart={(e) => handleTouch('right', e)}
            onClick={(e) => handleTouch('right', e)}
            aria-label="Move Right"
            className="w-14 h-14 dpad-btn bg-white/85 active:bg-amber-300 text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white/90 active:scale-90 transition-all"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Center: Mode switcher */}
        {onCycleMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('tap');
              onCycleMode();
            }}
            className="pointer-events-auto mb-2 px-2.5 py-1 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-slate-800 border border-white/50 shadow-sm active:scale-95"
          >
            D-Pad
          </button>
        )}

        {/* Right Thumb: Big Hop Forward & Small Step Back */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 p-2 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl">
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Hop Forward"
            className="w-20 h-16 dpad-btn bg-gradient-to-b from-emerald-400 to-emerald-500 active:from-emerald-300 active:to-emerald-400 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 border-emerald-200 active:scale-95 transition-all"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span className="text-[10px] font-black uppercase tracking-wider">HOP</span>
          </button>
          <button
            onTouchStart={(e) => handleTouch('down', e)}
            onClick={(e) => handleTouch('down', e)}
            aria-label="Step Back"
            className="w-14 h-10 dpad-btn bg-white/80 active:bg-amber-300 text-slate-800 rounded-xl flex items-center justify-center shadow-md border border-white/90 active:scale-90 transition-all"
          >
            <ArrowDown className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  // Classic Ergonomic D-Pad Mode (Default)
  const positionClasses = {
    left: 'justify-start pl-4',
    center: 'justify-center',
    right: 'justify-end pr-4',
  }[dpadPosition];

  return (
    <div className={`fixed bottom-3 left-0 right-0 pb-safe flex ${positionClasses} pointer-events-none z-30 select-none touch-control-surface`}>
      <div className="relative pointer-events-auto">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 sm:w-52 sm:h-52 p-2 bg-white/25 backdrop-blur-xl rounded-3xl border-2 border-white/40 shadow-2xl">
          {/* UP */}
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Move Up"
            className="col-start-2 row-start-1 dpad-btn bg-white/90 active:bg-emerald-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-all"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </button>

          {/* LEFT */}
          <button
            onTouchStart={(e) => handleTouch('left', e)}
            onClick={(e) => handleTouch('left', e)}
            aria-label="Move Left"
            className="col-start-1 row-start-2 dpad-btn bg-white/90 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-all"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>

          {/* CENTER ICON / BUNNY LOGO (Tap to Hop Forward as well!) */}
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Quick Hop"
            className="col-start-2 row-start-2 dpad-btn bg-white/40 active:bg-amber-200 text-slate-800 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/40 active:scale-95 transition-all"
          >
            🐰
          </button>

          {/* RIGHT */}
          <button
            onTouchStart={(e) => handleTouch('right', e)}
            onClick={(e) => handleTouch('right', e)}
            aria-label="Move Right"
            className="col-start-3 row-start-2 dpad-btn bg-white/90 active:bg-amber-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-all"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>

          {/* DOWN */}
          <button
            onTouchStart={(e) => handleTouch('down', e)}
            onClick={(e) => handleTouch('down', e)}
            aria-label="Move Down"
            className="col-start-2 row-start-3 dpad-btn bg-white/90 active:bg-rose-300 hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-all"
          >
            <ArrowDown className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Quick Position Docking and Layout Toggle Pills */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/70 shadow-sm text-[9px] font-black uppercase text-slate-600">
          {onCyclePosition && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                onCyclePosition();
              }}
              title="Dock D-Pad (Left/Center/Right)"
              className="hover:text-emerald-600 active:scale-90 px-1 py-0.5 cursor-pointer"
            >
              Dock: {dpadPosition}
            </button>
          )}
          {onCycleMode && (
            <>
              <span>•</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  onCycleMode();
                }}
                title="Switch Control Layout"
                className="hover:text-amber-600 active:scale-90 px-1 py-0.5 cursor-pointer text-amber-700"
              >
                Split
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
