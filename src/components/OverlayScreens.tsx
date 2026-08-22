'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Sparkles, Trophy, Heart, Clock, PlusCircle, Smartphone, Keyboard } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import { BUNNY_SKINS } from '@/lib/game/types';
import {
  MAX_DAILY_LIVES,
  EXTRA_LIFE_CARROT_COST,
  getRemainingTimeUntilMidnight,
} from '@/lib/game/livesManager';
import { WalletButton } from './WalletButton';

interface StartOverlayProps {
  onStart: () => void;
  onOpenWardrobe: () => void;
  selectedSkin: string;
  totalCarrots: number;
  lives: number;
  onBuyLife: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  onStart,
  onOpenWardrobe,
  selectedSkin,
  totalCarrots,
  lives,
  onBuyLife,
}) => {
  const currentSkinObj = BUNNY_SKINS[selectedSkin] || BUNNY_SKINS.classic;
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const updateTimer = () => {
      setTimeLeft(getRemainingTimeUntilMidnight().formatted);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOutOfLives = lives <= 0;
  const canAffordLife = totalCarrots >= EXTRA_LIFE_CARROT_COST;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="modal-container w-full max-w-md text-center relative overflow-hidden max-h-[92dvh] overflow-y-auto !p-4 sm:!p-8">
        {/* Top Wallet Connect Option */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 scale-90 sm:scale-100 origin-top-right">
          <WalletButton compact />
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-orange/20 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-purple/20 rounded-full blur-[40px] pointer-events-none" />

        {/* Title */}
        <div className="inline-block px-3 py-1 bg-brand-orange/10 border border-brand-orange/30 rounded-full text-brand-orange text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 sm:mb-3">
          Carrot Bonanza Edition
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight mb-2">
          🐰 Bunny Hop
        </h1>
        <p className="text-white/60 text-xs sm:text-sm font-semibold mt-1 sm:mt-2 mb-3 leading-relaxed">
          Hop across busy highways &amp; log-filled rivers. Harvest delicious carrots along the way!
        </p>

        {/* Daily Lives Display Box */}
        <div className="my-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-black text-rose-400">Daily Free Lives</div>
              <div className="text-xs sm:text-sm font-black text-rose-400">
                {lives} / {MAX_DAILY_LIVES} Remaining Today
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-rose-400/80 bg-rose-500/10 px-2 py-1 rounded-lg">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Out of Lives Warning & Refill Action */}
        {isOutOfLives ? (
          <div className="my-3 p-4 bg-brand-orange/10 border border-brand-orange/30 rounded-2xl text-left space-y-2">
            <div className="font-extrabold text-brand-orange text-xs sm:text-sm flex items-center gap-1.5">
              <span>⚠️</span> Out of daily free lives!
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed">
              Your 5 daily lives reset at midnight, or you can exchange {EXTRA_LIFE_CARROT_COST} 🥕 Carrots for +1 Extra Life now!
            </p>
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('carrot');
                onBuyLife();
              }}
              disabled={!canAffordLife}
              className={`w-full mt-2 py-2.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${
                canAffordLife
                  ? 'bg-brand-orange hover:bg-brand-orange-dark text-white cursor-pointer active:scale-95'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buy +1 Life ({EXTRA_LIFE_CARROT_COST} 🥕)</span>
            </button>
          </div>
        ) : (
          /* Equipped Bunny Preview Pill */
          <div
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            className="mx-auto my-3 p-2.5 bg-brand-surface hover:bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-95 group max-w-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🐰</span>
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] uppercase font-black text-white/50">Equipped Skin</div>
                <div className="text-xs sm:text-sm font-extrabold text-white">{currentSkinObj.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-xl">
              <span>{totalCarrots} 🥕</span>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
        )}

        {/* Play Button (disabled if 0 lives) */}
        <button
          onClick={() => {
            if (!isOutOfLives) {
              soundEngine.playClick();
              triggerHaptic('hop');
              onStart();
            }
          }}
          disabled={isOutOfLives}
          className={`w-full mt-4 py-4 font-black text-xl sm:text-2xl tracking-wider uppercase flex items-center justify-center gap-3 group min-h-[64px] ${
            !isOutOfLives
              ? 'btn-primary bg-brand-purple hover:bg-brand-purple-dark text-white shadow-[0_6px_0_var(--color-brand-purple-dark)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-brand-purple-dark)]'
              : 'bg-white/10 text-white/40 cursor-not-allowed rounded-2xl'
          }`}
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current group-hover:scale-110 transition-transform" />
          <span>{isOutOfLives ? 'NO LIVES LEFT' : 'HOP IN & PLAY'}</span>
        </button>

        {/* Quick Instructions tailored for mobile or desktop */}
        <div className="mt-5 pt-4 border-t border-white/10 text-[11px] sm:text-xs text-white/50 font-medium space-y-2">
          {isTouchDevice ? (
            <div className="flex items-center justify-center gap-2 text-white/70 font-bold">
              <Smartphone className="w-4 h-4 text-brand-purple" />
              <span>Swipe Screen or Tap D-Pad Buttons to Hop</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-white/70 font-bold flex-wrap">
              <span className="bg-brand-surface px-2 py-1 rounded border border-white/10">WASD</span>
              <span className="text-white/40">or</span>
              <span className="bg-brand-surface px-2 py-1 rounded border border-white/10">ARROWS</span>
              <span className="text-white/40">or</span>
              <span className="bg-brand-surface px-2 py-1 rounded border border-white/10">CLICK</span>
            </div>
          )}
          <p className="text-[10px] sm:text-[11px] text-brand-orange/80">⚡ Speed increases every 5s • Snag 🥕 carrots for extra lives &amp; skins!</p>
        </div>
      </div>
    </div>
  );
};

interface GameOverOverlayProps {
  score: number;
  sessionCarrots: number;
  maxCarrots: number;
  rewardTier: 'none' | 'fcfs' | 'guaranteed';
  totalCarrots: number;
  highScore: number;
  isNewHigh: boolean;
  lives: number;
  onRetry: () => void;
  onOpenWardrobe: () => void;
  onBuyLife: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  sessionCarrots,
  maxCarrots,
  rewardTier,
  totalCarrots,
  highScore,
  isNewHigh,
  lives,
  onRetry,
  onOpenWardrobe,
  onBuyLife,
}) => {
  const carrotBonusPoints = sessionCarrots * 5;
  const totalRunScore = score + carrotBonusPoints;
  const isOutOfLives = lives <= 0;
  const canAffordLife = totalCarrots >= EXTRA_LIFE_CARROT_COST;

  useEffect(() => {
    if (isNewHigh) {
      soundEngine.playFanfare();
      triggerHaptic('fanfare');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      triggerHaptic('gameover');
    }
  }, [isNewHigh]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="modal-container w-full max-w-md text-center relative overflow-hidden max-h-[92dvh] overflow-y-auto !p-5 sm:!p-8">
        {/* Title */}
        <div className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight">
          Oof! Squished!
        </div>
        <p className="text-[11px] sm:text-sm text-white/60 font-medium mt-1 mb-3">
          Here is your run harvest breakdown:
        </p>

        {/* Score Breakdown Card */}
        <div className="bg-brand-surface border border-white/10 rounded-2xl p-4 my-2 text-left space-y-3">
          {/* Distance */}
          <div className="flex justify-between items-center text-xs sm:text-sm font-extrabold text-white/80">
            <span className="flex items-center gap-2">
              <span>🛣️</span> Distance Reached
            </span>
            <span className="text-sm sm:text-base text-white">{score} pts</span>
          </div>

          {/* Carrots */}
          <div className="flex justify-between items-center text-xs sm:text-sm font-extrabold text-white/80">
            <span className="flex items-center gap-2">
              <span>🥕</span> Carrots Gathered ({sessionCarrots}/{maxCarrots})
            </span>
            <span className="text-sm sm:text-base text-brand-orange">+{carrotBonusPoints} pts</span>
          </div>

          {/* Reward Tier Banner */}
          {rewardTier === 'guaranteed' && (
            <div className="flex items-center gap-3 bg-brand-purple/10 border border-brand-purple/30 rounded-xl px-3 py-2 mt-2">
              <span className="text-lg">💎</span>
              <div>
                <div className="text-[11px] font-black text-brand-purple">1/100 RARE — GUARANTEED REWARD UNLOCKED!</div>
                <div className="text-[10px] text-brand-purple/70 mt-0.5">9 Carrots collected. You qualify for a guaranteed reward!</div>
              </div>
            </div>
          )}
          {rewardTier === 'fcfs' && (
            <div className="flex items-center gap-3 bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-3 py-2 mt-2">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-[11px] font-black text-brand-orange">🎉 FCFS Reward Tier Qualified!</div>
                <div className="text-[10px] text-brand-orange/70 mt-0.5">5-8 Carrots collected. First-Come-First-Served reward slot!</div>
              </div>
            </div>
          )}
          {rewardTier === 'none' && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mt-2">
              <span className="text-lg">🟤</span>
              <div>
                <div className="text-[11px] font-bold text-white/50">1-4 Carrots: No Reward Tier</div>
                <div className="text-[10px] text-white/40 mt-0.5">Collect 5+ carrots in a run to earn rewards!</div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 pt-3 mt-1 flex justify-between items-end">
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider text-white/50">
              Total Run Score
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
              {totalRunScore}
            </span>
          </div>
        </div>

        {/* Lives Remaining Bar */}
        <div className="my-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-[11px] sm:text-xs font-bold text-rose-400">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Daily Lives: {lives}/{MAX_DAILY_LIVES}</span>
          </div>
          {isOutOfLives && (
            <span className="text-[10px] font-black uppercase text-rose-200 bg-rose-500 px-2 py-1 rounded">
              0 Left
            </span>
          )}
        </div>

        {/* High Score Banner */}
        <div className="my-2 flex items-center justify-between px-4 py-2 bg-brand-orange/10 border border-brand-orange/20 rounded-xl">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-brand-orange">
            <Trophy className="w-4 h-4 text-brand-orange" />
            <span>High Score: {highScore}</span>
          </div>
          {isNewHigh && (
            <span className="text-[10px] font-black text-brand-dark bg-brand-orange px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">
              🎉 New Record!
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-5">
          {!isOutOfLives ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('hop');
                onRetry();
              }}
              className="btn-primary w-full py-4 text-xl tracking-wider min-h-[56px]"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>HOP AGAIN ({lives} ❤️)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('carrot');
                onBuyLife();
              }}
              disabled={!canAffordLife}
              className={`w-full py-4 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[56px] ${
                canAffordLife
                  ? 'bg-brand-orange hover:bg-brand-orange-dark text-white shadow-[0_5px_0_var(--color-brand-orange-dark)] active:translate-y-1 active:shadow-[0_1px_0_var(--color-brand-orange-dark)] cursor-pointer'
                  : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Refill Life ({EXTRA_LIFE_CARROT_COST} 🥕)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            className="w-full py-3 bg-brand-surface hover:bg-white/5 text-white/80 font-extrabold text-sm rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>Bunny Wardrobe ({totalCarrots} 🥕)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenWardrobe: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onOpenWardrobe,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="modal-container w-full max-w-sm text-center">
        <h2 className="text-3xl font-black text-white mb-2">Game Paused</h2>
        <p className="text-sm text-white/50 font-medium mb-6">Take a breather, hopper!</p>

        <div className="space-y-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onResume();
            }}
            className="btn-primary w-full py-3 text-lg min-h-[52px]"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onRestart();
            }}
            className="w-full py-3 bg-brand-surface hover:bg-white/5 text-white/90 font-extrabold text-sm rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[52px]"
          >
            <RotateCcw className="w-4 h-4 text-white/50" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            className="w-full py-3 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange font-extrabold text-sm rounded-xl border border-brand-orange/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[52px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bunny Wardrobe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
