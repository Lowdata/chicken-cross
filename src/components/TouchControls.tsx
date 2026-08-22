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
        <div className="bg-brand-surface/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white/80 text-xs font-bold">
          <span>👆 Swipe anywhere to Hop</span>
          {onCycleMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                onCycleMode();
              }}
              className="bg-brand-purple/20 hover:bg-brand-purple/40 active:bg-brand-purple/60 text-[11px] font-black text-brand-purple shadow-[0_0_15px_rgba(139,92,246,0.3)] px-2 py-0.5 rounded-full uppercase tracking-wider transition-all"
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
        <div className="pointer-events-auto flex items-center gap-2 p-2 bg-brand-surface/80 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            onTouchStart={(e) => handleTouch('left', e)}
            onClick={(e) => handleTouch('left', e)}
            aria-label="Move Left"
            className="w-14 h-14 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none border border-white/10 transition-all"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>
          <button
            onTouchStart={(e) => handleTouch('right', e)}
            onClick={(e) => handleTouch('right', e)}
            aria-label="Move Right"
            className="w-14 h-14 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none border border-white/10 transition-all"
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
            className="pointer-events-auto mb-2 px-2.5 py-1 bg-brand-surface/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-white/80 hover:text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95"
          >
            D-Pad
          </button>
        )}

        {/* Right Thumb: Big Hop Forward & Small Step Back */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 p-2 bg-brand-surface/80 backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Hop Forward"
            className="w-20 h-16 dpad-btn bg-brand-purple active:bg-brand-purple-dark text-white rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_0_var(--color-brand-purple-dark)] active:translate-y-1 active:shadow-none transition-all border-none"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span className="text-[10px] font-black uppercase tracking-wider">HOP</span>
          </button>
          <button
            onTouchStart={(e) => handleTouch('down', e)}
            onClick={(e) => handleTouch('down', e)}
            aria-label="Step Back"
            className="w-14 h-10 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-xl flex items-center justify-center shadow-[0_2px_0_rgba(255,255,255,0.1)] active:translate-y-0.5 active:shadow-none border border-white/10 transition-all"
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
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 sm:w-52 sm:h-52 p-2 bg-brand-surface/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* UP */}
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Move Up"
            className="col-start-2 row-start-1 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-brand-purple/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] border border-white/10 active:translate-y-1 active:shadow-none transition-all"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </button>

          {/* LEFT */}
          <button
            onTouchStart={(e) => handleTouch('left', e)}
            onClick={(e) => handleTouch('left', e)}
            aria-label="Move Left"
            className="col-start-1 row-start-2 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] border border-white/10 active:translate-y-1 active:shadow-none transition-all"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>

          {/* CENTER ICON / BUNNY LOGO (Tap to Hop Forward as well!) */}
          <button
            onTouchStart={(e) => handleTouch('up', e)}
            onClick={(e) => handleTouch('up', e)}
            aria-label="Quick Hop"
            className="col-start-2 row-start-2 dpad-btn bg-brand-surface/50 active:bg-white/10 text-white rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10 active:scale-95 transition-all"
          >
            🐰
          </button>

          {/* RIGHT */}
          <button
            onTouchStart={(e) => handleTouch('right', e)}
            onClick={(e) => handleTouch('right', e)}
            aria-label="Move Right"
            className="col-start-3 row-start-2 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] border border-white/10 active:translate-y-1 active:shadow-none transition-all"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>

          {/* DOWN */}
          <button
            onTouchStart={(e) => handleTouch('down', e)}
            onClick={(e) => handleTouch('down', e)}
            aria-label="Move Down"
            className="col-start-2 row-start-3 dpad-btn bg-brand-surface hover:bg-white/10 active:bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)] border border-white/10 active:translate-y-1 active:shadow-none transition-all"
          >
            <ArrowDown className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Quick Position Docking and Layout Toggle Pills */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-brand-surface backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[9px] font-black uppercase text-white/70">
          {onCyclePosition && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                onCyclePosition();
              }}
              title="Dock D-Pad (Left/Center/Right)"
              className="hover:text-brand-purple active:scale-90 px-1 py-0.5 cursor-pointer transition-colors"
            >
              Dock: {dpadPosition}
            </button>
          )}
          {onCycleMode && (
            <>
              <span className="text-white/30">•</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  onCycleMode();
                }}
                title="Switch Control Layout"
                className="hover:text-brand-purple active:scale-90 px-1 py-0.5 cursor-pointer text-brand-purple transition-colors"
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
