'use client';

import React from 'react';
import { Volume2, VolumeX, Sparkles, Pause, Trophy, Heart, Zap } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { MAX_DAILY_LIVES } from '@/lib/game/livesManager';
import { WalletButton } from './WalletButton';

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
  onPause: () => void;
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';
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
  onPause,
  gameStatus,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 p-3 sm:p-5 flex justify-between items-start pointer-events-none z-30 select-none">
      {/* Left side: Score, Live Carrots, and Speed Multiplier */}
      <div className="flex flex-col gap-2 items-start pointer-events-auto">
        {/* Score pill */}
        <div className="hud-pill bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2.5 transition-transform hover:scale-105">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">SCORE</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
            {score}
          </span>
        </div>

        {/* Live session carrots collected */}
        <div className="hud-pill bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white backdrop-blur-md border-2 border-orange-200/50 rounded-2xl px-3.5 py-1.5 shadow-md flex items-center gap-2 animate-bounce-subtle">
          <span className="text-lg">🥕</span>
          <span className="font-extrabold text-lg sm:text-xl tracking-wide">+{sessionCarrots}</span>
        </div>

        {/* Speed / Difficulty boost badge (shows when multiplier > 1.0) */}
        {gameStatus === 'playing' && difficultyMultiplier > 1.0 && (
          <div className="hud-pill bg-gradient-to-r from-amber-500/90 to-rose-500/90 text-white backdrop-blur-md border-2 border-amber-200/60 rounded-xl px-2.5 py-1 shadow-md flex items-center gap-1.5 text-xs font-black tracking-wide animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{difficultyMultiplier}x Speed (Lvl {difficultyLevel})</span>
          </div>
        )}
      </div>

      {/* Center Top: Daily Lives Hearts */}
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
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Web3 Wallet Connect Button */}
          <WalletButton />

          {/* Mobile Hearts Pill */}
          <div className="md:hidden hud-pill bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-2xl px-2.5 py-1.5 shadow-md flex items-center gap-1">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="text-sm font-black text-rose-600">{lives}/{MAX_DAILY_LIVES}</span>
          </div>

          {/* Total Carrot Bank */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenWardrobe();
            }}
            title="Carrot Bank & Skins"
            className="hud-pill bg-amber-50/90 hover:bg-amber-100/95 backdrop-blur-md border-2 border-amber-300/80 rounded-2xl px-3 py-1.5 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 group"
          >
            <span className="text-base group-hover:rotate-12 transition-transform">🥕</span>
            <span className="text-sm sm:text-base font-black text-amber-900">{totalCarrots}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 ml-0.5" />
          </button>

          {/* High Score Pill */}
          <div className="hud-pill bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-2xl px-3 py-1.5 shadow-md flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs uppercase font-extrabold text-slate-400 hidden sm:inline">BEST</span>
            <span className="text-sm sm:text-base font-black text-amber-600">{highScore}</span>
          </div>
        </div>

        {/* Action buttons (Audio, Wardrobe, Pause) */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            className="hud-btn w-10 h-10 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border-2 border-white/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-90 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          {gameStatus === 'playing' && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onPause();
              }}
              className="hud-btn w-10 h-10 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md border-2 border-white/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-90 transition-all cursor-pointer"
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Pause className="w-5 h-5 text-slate-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
