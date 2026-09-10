'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  ninthCarrotRadar?: {
    active: boolean;
    distanceHops: number;
    angleDeg: number;
  } | null;
}

const chip = 'flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5';
const control = 'w-[44px] h-[44px] rounded-[14px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 flex items-center justify-center text-white/85 hover:bg-white/10 active:scale-90 transition-all cursor-pointer';
const menuItem = 'flex items-center gap-[10px] w-full min-h-[44px] px-[12px] rounded-[10px] text-left font-outfit font-semibold text-[13px] text-white/85 hover:bg-white/10 active:scale-[.97] transition-all cursor-pointer';
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
  ninthCarrotRadar,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [menuOpen]);

  useEffect(() => { if (gameStatus !== 'playing') setMenuOpen(false); }, [gameStatus]);

  const isApexEagle = sessionCarrots >= 8 && maxCarrots === 8;
  const isEscalatedEagle = sessionCarrots >= 7;

  return (
    <header className="fixed top-0 left-0 right-0 pt-safe px-[18px] py-3.5 flex justify-between items-start pointer-events-none z-30 select-none">
      {/* Eagle Warning Banner */}
      {isEagleWarning && gameStatus === 'playing' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 sm:top-4 z-40 pointer-events-none animate-bounce">
          <div className={`${isApexEagle ? 'bg-red-700/95 border-amber-300 shadow-[0_0_35px_rgba(255,0,0,0.95)]' : isEscalatedEagle ? 'bg-amber-700/95 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.85)]' : 'bg-rose-600/95 border-amber-300 shadow-[0_0_30px_rgba(225,29,72,0.85)]'} border-2 text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl flex items-center gap-2 sm:gap-2.5 backdrop-blur-md animate-pulse`}>
            <span className="text-xl sm:text-2xl">🦅</span>
            <div className="text-left">
              <div className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-200 leading-tight">
                {isApexEagle ? 'APEX EAGLE STRIKE!' : isEscalatedEagle ? 'EAGLE HUNT ESCALATED!' : 'EAGLE INCOMING!'}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-white/95 leading-tight">
                {isApexEagle ? 'Full harvest gathered! Survive the predator!' : isEscalatedEagle ? 'Predator hunting aggressively! EVADE!' : 'Watch the shadow corridor & EVADE!'}
              </div>
            </div>
            <span className="text-lg sm:text-xl text-amber-300">⚠️</span>
          </div>
        </div>
      )}

      {/* 9th Golden Carrot Navigation Radar Banner */}
      {ninthCarrotRadar?.active && gameStatus === 'playing' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-16 sm:top-20 z-40 pointer-events-none select-none animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/95 via-yellow-400/95 to-amber-500/95 text-slate-950 font-black shadow-[0_0_35px_rgba(255,215,0,0.95)] border-2 border-white backdrop-blur-md">
            <span className="text-xl">✨</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] uppercase tracking-wider text-slate-900 font-extrabold">
                9TH GOLDEN CARROT DETECTED!
              </span>
              <span className="text-xs font-black text-slate-950">
                {ninthCarrotRadar.distanceHops} {ninthCarrotRadar.distanceHops === 1 ? 'hop' : 'hops'} ahead
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-inner transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${ninthCarrotRadar.angleDeg}deg)`,
              }}
              title={`${ninthCarrotRadar.distanceHops} hops away`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M12 2L4 12h5v10h6V12h5L12 2z" />
              </svg>
            </div>
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

        <div className="hidden min-[821px]:flex items-center gap-2">
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

        <div className="relative min-[821px]:hidden" ref={menuRef}>
          <button
            onClick={() => { soundEngine.playClick(); triggerHaptic('tap'); setMenuOpen((v) => !v); }}
            className={control}
            aria-label="Game menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <i className="block w-[16px] h-[2px] rounded-full bg-current" />
              <i className="block w-[16px] h-[2px] rounded-full bg-current" />
              <i className="block w-[16px] h-[2px] rounded-full bg-current" />
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[52px] min-w-[196px] rounded-[14px] p-[6px] flex flex-col gap-[2px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 shadow-[0_18px_44px_rgba(6,2,22,.6)]"
            >
              <button role="menuitem" className={menuItem} onClick={() => { setMenuOpen(false); if (onOpenTasks) { soundEngine.playClick(); triggerHaptic('tap'); onOpenTasks(); } }}>
                <Image src="/pp-figma/hud-gift.svg" alt="" width={17} height={17} className="w-[17px] h-[17px]" />
                <span>tasks &amp; rewards</span>
              </button>
              <button role="menuitem" className={menuItem} onClick={() => { setMenuOpen(false); soundEngine.playClick(); triggerHaptic('tap'); onToggleSound(); }}>
                <Image src="/pp-figma/hud-sound.svg" alt="" width={17} height={17} className={`w-[17px] h-[17px] ${soundEnabled ? '' : 'opacity-40'}`} />
                <span>{soundEnabled ? 'mute audio' : 'unmute audio'}</span>
              </button>
              {gameStatus === 'playing' && (
                <button role="menuitem" className={menuItem} onClick={() => { setMenuOpen(false); soundEngine.playClick(); triggerHaptic('tap'); onPause(); }}>
                  <Image src="/pp-figma/hud-pause.svg" alt="" width={17} height={17} className="w-[17px] h-[17px]" />
                  <span>pause game</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
