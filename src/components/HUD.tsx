'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import { MAX_DAILY_LIVES } from '@/lib/game/livesManager';
import { WalletButton } from './WalletButton';

interface HUDProps {
  score: number;
  sessionCarrots: number;
  maxCarrots?: number;
  totalCarrots: number;
  highScore: number;
  lives: number;
  difficultyLevel: number;
  difficultyMultiplier: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenWardrobe: () => void;
  onOpenTasks?: () => void;
  onPause: () => void;
  gameStatus: 'idle' | 'playing' | 'paused' | 'gameover';
  isEagleWarning?: boolean;
}

const chip = 'flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5';
const control = 'w-[44px] h-[44px] rounded-[14px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 flex items-center justify-center text-white/85 hover:bg-white/10 active:scale-90 transition-all cursor-pointer';
const label = 'font-outfit font-semibold text-[11px] tracking-[1.54px] uppercase text-white/50 whitespace-nowrap';

export const HUD: React.FC<HUDProps> = ({
  score,
  sessionCarrots,
  maxCarrots = 8,
  totalCarrots,
  highScore,
  lives,
  difficultyLevel,
  difficultyMultiplier,
  soundEnabled,
  onToggleSound,
  onOpenWardrobe,
  onOpenTasks,
  onPause,
  gameStatus,
  isEagleWarning,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 pt-safe px-[18px] py-3.5 flex justify-between items-start pointer-events-none z-30 select-none">
      {isEagleWarning && gameStatus === 'playing' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 sm:top-4 z-40 pointer-events-none animate-bounce">
          <div className="bg-rose-600/95 border-2 border-amber-300 text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.85)] flex items-center gap-2 sm:gap-2.5 backdrop-blur-md animate-pulse">
            <span className="text-xl sm:text-2xl">🦅</span>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-200 leading-tight">
                EAGLE INCOMING!
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-white/95 leading-tight">
                Watch the shadow corridor &amp; EVADE!
              </div>
            </div>
            <span className="text-lg sm:text-xl text-amber-300">⚠️</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 items-start pointer-events-auto">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="w-11 h-11 min-h-[44px] rounded-full bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 flex items-center justify-center text-white/85 hover:bg-white/10 active:scale-90 transition-all"
        >
          <Image src="/pp-figma/hud-back.svg" alt="" width={16} height={16} className="w-4 h-4" />
        </Link>

        <div className={chip}>
          <span className={label}>score</span>
          <span className="font-outfit font-bold text-[15px] text-[#ffe14d] leading-none whitespace-nowrap">
            {score}
          </span>
        </div>

        <div className={chip}>
          <Image src="/pp-figma/hud-carrot.png" alt="" width={17} height={17} className="w-[17px] h-[17px] object-contain" />
          <span className="font-outfit font-bold text-[15px] text-[#ffb45e] leading-none whitespace-nowrap">
            {sessionCarrots}
          </span>
          <span className={label}>{`/${maxCarrots}`}</span>
        </div>

        {gameStatus === 'playing' && difficultyMultiplier > 1.0 && (
          <div className={chip}>
            <Image src="/pp-figma/hud-spd.svg" alt="" width={13} height={13} className="w-[13px] h-[13px]" />
            <span className="font-outfit font-bold text-[13px] text-[#c9b6ff] leading-none whitespace-nowrap">
              {difficultyMultiplier}x
            </span>
            <span className={label}>spd</span>
          </div>
        )}
      </div>

      <div className="max-[820px]:hidden pointer-events-auto flex items-center h-[38px] mt-0.5 rounded-full px-4 gap-1 md:gap-2.5 bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35]">
        <span className="hidden md:inline font-outfit font-bold text-[11px] tracking-[1.98px] uppercase text-white/55 whitespace-nowrap">
          lives
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_DAILY_LIVES }).map((_, idx) => (
            <Image
              key={idx}
              src="/pp-figma/hud-heart.png"
              alt=""
              width={19}
              height={19}
              className={`w-4 h-[19px] md:w-[19px] object-contain transition-opacity duration-300 ${idx < lives ? 'opacity-100' : 'opacity-30'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className={`${chip} hidden max-[820px]:flex`} aria-hidden="true">
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_DAILY_LIVES }).map((_, idx) => (
              <Image
                key={idx}
                src="/pp-figma/hud-heart.png"
                alt=""
                width={19}
                height={19}
                className={`w-4 h-4 object-contain transition-opacity duration-300 ${idx < lives ? 'opacity-100' : 'opacity-30'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end gap-2">
          <WalletButton />

          <div className={chip}>
            <span className="w-2 h-2 rounded-full bg-[#8bf3c4] shadow-[0_0_8px_rgba(139,243,196,0.8)]" />
            <span className="font-outfit font-semibold text-[12px] text-white/82 whitespace-nowrap">
              Robinhood Chain
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            title="Carrot Bank & Skins"
            className={`${chip} hover:bg-white/10 transition-colors cursor-pointer group`}
          >
            <Image src="/pp-figma/hud-carrot.png" alt="" width={17} height={17} className="w-[17px] h-[17px] object-contain group-hover:rotate-12 transition-transform" />
            <span className="font-outfit font-bold text-[15px] text-[#ffb45e] leading-none whitespace-nowrap">
              {totalCarrots}
            </span>
            <Sparkles className="w-3 h-3 text-brand-orange" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenTasks) {
                soundEngine.playClick();
                triggerHaptic('tap');
                onOpenTasks();
              }
            }}
            title="Tasks & Rewards"
            className={control}
            aria-label="Tasks & Rewards"
          >
            <Image src="/pp-figma/hud-gift.svg" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onToggleSound();
            }}
            className={control}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle Sound"
          >
            <Image
              src="/pp-figma/hud-sound.svg"
              alt=""
              width={18}
              height={18}
              className={`w-[18px] h-[18px] ${soundEnabled ? '' : 'opacity-40'}`}
            />
          </button>

          {gameStatus === 'playing' && (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                onPause();
              }}
              className={control}
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Image src="/pp-figma/hud-pause.svg" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
