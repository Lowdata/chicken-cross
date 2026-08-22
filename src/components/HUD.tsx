'use client';

import React from 'react';
import { Volume2, VolumeX, Sparkles, Pause, Trophy, Heart, Zap, Gamepad2 } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import { MAX_DAILY_LIVES } from '@/lib/game/livesManager';
import { WalletButton } from './WalletButton';
import { TouchControlMode } from './TouchControls';

interface HUDProps {
  score: number;
  sessionCarrots: number;
  totalCarrots: number;
  highScore: number;
  lives: number;
  difficultyLevel: number;
  difficultyMultiplier: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenWardrobe: () => void;
  onOpenLeaderboard?: () => void;
  onPause: () => void;
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';
  controlMode?: TouchControlMode;
  onToggleControlMode?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  sessionCarrots,
  totalCarrots,
  highScore,
  lives,
  difficultyLevel,
  difficultyMultiplier,
  soundEnabled,
  onToggleSound,
  onOpenWardrobe,
  onOpenLeaderboard,
  onPause,
  gameStatus,
  controlMode = 'dpad',
  onToggleControlMode,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 pt-safe px-2.5 sm:px-5 py-2 flex justify-between items-start pointer-events-none z-30 select-none">
      {/* Left side: Score, Live Carrots, and Speed Multiplier */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-start pointer-events-auto">
        {/* Score pill */}
        <div className="hud-pill bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-400">SCORE</span>
          <span className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
            {score}
          </span>
        </div>

        {/* Live session carrots collected */}
        <div className="hud-pill bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white backdrop-blur-md border-2 border-orange-200/50 rounded-2xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-md flex items-center gap-1.5 sm:gap-2 animate-bounce-subtle">
          <span className="text-base sm:text-lg">🥕</span>
          <span className="font-extrabold text-sm sm:text-xl tracking-wide">+{sessionCarrots}</span>
        </div>

        {/* Speed / Difficulty boost badge (shows when multiplier > 1.0) */}
        {gameStatus === 'playing' && difficultyMultiplier > 1.0 && (
          <div className="hud-pill bg-gradient-to-r from-amber-500/90 to-rose-500/90 text-white backdrop-blur-md border-2 border-amber-200/60 rounded-xl px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-md flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black tracking-wide animate-pulse">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            <span>{difficultyMultiplier}x Spd</span>
          </div>
        )}
      </div>

      {/* Center Top: Daily Lives Hearts (Visible on tablet & desktop) */}
      <div className="pointer-events-auto hidden md:flex items-center gap-1.5 bg-white/85 backdrop-blur-md border-2 border-white/90 rounded-2xl px-3.5 py-2 shadow-md">
        <span className="text-xs uppercase font-black tracking-wider text-rose-500 mr-1 flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 fill-rose-500" /> Lives:
        </span>
        {Array.from({ length: MAX_DAILY_LIVES }).map((_, idx) => {
          const hasHeart = idx < lives;
          return (
            <span
              key={idx}
              className={`text-lg transition-transform duration-300 ${
                hasHeart ? 'scale-100 opacity-100 drop-shadow-sm' : 'scale-90 opacity-25 grayscale'
              }`}
            >
              ❤️
            </span>
          );
        })}
      </div>

      {/* Right side: Wallet, Highscore, Carrot Bank, Mobile Lives & Utility Actions */}
      <div className="flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Web3 Wallet Connect Button */}
          <WalletButton />

          {/* Mobile Hearts Pill */}
          <div className="md:hidden hud-pill bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-2xl px-2 py-1 shadow-md flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span className="text-xs font-black text-rose-600">{lives}/{MAX_DAILY_LIVES}</span>
          </div>

          {/* Total Carrot Bank */}
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            title="Carrot Bank & Skins"
            className="hud-pill bg-amber-50/90 hover:bg-amber-100/95 backdrop-blur-md border-2 border-amber-300/80 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all active:scale-95 group"
          >
            <span className="text-sm sm:text-base group-hover:rotate-12 transition-transform">🥕</span>
            <span className="text-xs sm:text-base font-black text-amber-900">{totalCarrots}</span>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 ml-0.5" />
          </button>

          {/* High Score Pill (Click to open Leaderboard) */}
          <button
            onClick={() => {
              if (onOpenLeaderboard) {
                soundEngine.playClick();
                triggerHaptic('tap');
                onOpenLeaderboard();
              }
            }}
            title="Global Leaderboard"
            className="hud-pill bg-white/90 hover:bg-white backdrop-blur-md border-2 border-white/80 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all active:scale-95 group"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 hidden xs:inline">BEST</span>
            <span className="text-xs sm:text-base font-black text-amber-600">{highScore}</span>
          </button>
        </div>

        {/* Action buttons (Audio, Touch Controls Toggle, Pause) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Touch Mode Toggle */}
          {onToggleControlMode && (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                onToggleControlMode();
              }}
              className="hud-btn h-8 sm:h-10 px-2.5 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border-2 border-white/90 shadow-md flex items-center justify-center gap-1 text-slate-700 hover:text-slate-900 active:scale-90 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider"
              title={`Current Controls: ${controlMode.toUpperCase()}`}
              aria-label="Toggle Control Mode"
            >
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span className="hidden xs:inline">{controlMode}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onToggleSound();
            }}
            className="hud-btn w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border-2 border-white/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-90 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            )}
          </button>

          {/* Pause Button */}
          {gameStatus === 'playing' && (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                onPause();
              }}
              className="hud-btn w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border-2 border-white/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-90 transition-all cursor-pointer"
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
