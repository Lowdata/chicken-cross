'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Play, RotateCcw, Sparkles, Trophy, Heart, Clock, PlusCircle,
  Smartphone, Keyboard, MapPin, Carrot, Diamond, Zap, CircleDot,
  Home, ArrowLeft,
} from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import { BUNNY_SKINS } from '@/lib/game/types';
import {
  MAX_DAILY_LIVES,
  EXTRA_LIFE_CARROT_COST,
  getRemainingTimeUntilMidnight,
} from '@/lib/game/livesManager';
import { WalletButton } from './WalletButton';

/* ── Inline Carrot SVG icon (replaces emoji) ── */
const CarrotIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M16.5 2.5L14 5l3 3 2.5-2.5M12 8l-8.5 8.5a2.12 2.12 0 003 3L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11.5l1.5 1.5M11 9.5l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface StartOverlayProps {
  onStart: () => void;
  onOpenWardrobe: () => void;
  selectedSkin: string;
  totalCarrots: number;
  lives: number;
  onBuyLife: () => void;
  onFreeRefill?: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  onStart,
  onOpenWardrobe,
  selectedSkin,
  totalCarrots,
  lives,
  onBuyLife,
  onFreeRefill,
}) => {
  const router = useRouter();
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

        {/* Skin Preview Pill */}
        <div className="flex items-center gap-3 mb-5 mt-2 sm:mt-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl bg-brand-surface border border-white/10 shadow-md"
            style={{ backgroundColor: `#${currentSkinObj.colors.body.toString(16).padStart(6, '0')}22` }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke={`#${currentSkinObj.colors.body.toString(16).padStart(6, '0')}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 16a3 3 0 0 1 2.24 5" />
              <path d="M18 12h.01" />
              <path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3" />
              <path d="M20 8.54V4a2 2 0 1 0-4 0v3" />
              <path d="M7.612 12.524a3 3 0 1 0-1.6 4.3" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-black text-sm sm:text-base text-white leading-none">{currentSkinObj.name}</div>
            <button
              onClick={() => { soundEngine.playClick(); triggerHaptic('tap'); onOpenWardrobe(); }}
              className="text-brand-orange text-[11px] font-bold hover:underline mt-1"
            >
              Change Skin
            </button>
          </div>
        </div>

        {/* Lives Status */}
        <div className="bg-brand-surface border border-white/10 rounded-2xl p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Daily Lives</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/30" />
              <span className="text-[10px] text-white/30 font-medium">Resets in {timeLeft}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_DAILY_LIVES }).map((_, i) => (
              <Heart key={i} className={`w-5 h-5 transition-all ${i < lives ? 'fill-rose-500 text-rose-500 scale-100' : 'text-white/10 scale-90'}`} />
            ))}
          </div>
        </div>

        {/* Main CTA or Buy Life */}
        {!isOutOfLives ? (
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('hop');
              onStart();
            }}
            className="btn-primary w-full py-4 text-xl tracking-wider min-h-[56px]"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>HOP ({lives} lives left)</span>
          </button>
        ) : canAffordLife ? (
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('carrot');
              onBuyLife();
            }}
            className="w-full py-4 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[56px] bg-brand-orange hover:bg-brand-orange-dark text-white shadow-[0_5px_0_var(--color-brand-orange-dark)] active:translate-y-1 active:shadow-[0_1px_0_var(--color-brand-orange-dark)] cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Refill Life ({EXTRA_LIFE_CARROT_COST} carrots)</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('carrot');
              if (onFreeRefill) onFreeRefill();
              else onBuyLife();
            }}
            className="w-full py-4 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[56px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-[0_1px_0_#059669] cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Free Refill (+5 Lives)</span>
          </button>
        )}

        {/* Back to Home */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 py-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-extrabold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to Home</span>
        </button>

        {/* Controls Tip */}
        <div className="mt-3 bg-brand-surface/80 rounded-xl border border-white/10 p-3 text-center">
          {isTouchDevice ? (
            <p className="text-[11px] text-white/80 font-bold flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-brand-pink" /> Use Split on-screen buttons to hop
            </p>
          ) : (
            <p className="text-[11px] text-white/80 font-bold flex items-center justify-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-brand-pink" /> Arrow keys or WASD to hop
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-brand-orange font-semibold mt-1 flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-brand-orange" /> Speed increases every 5s &mdash; snag carrots for extra lives &amp; skins!
          </p>
        </div>
      </div>
    </div>
  );
};

interface GameOverOverlayProps {
  score: number;
  sessionCarrots: number;
  rewardTier: 'none' | 'fcfs' | 'guaranteed';
  totalCarrots: number;
  highScore: number;
  isNewHigh: boolean;
  lives: number;
  onRetry: () => void;
  onOpenWardrobe: () => void;
  onBuyLife: () => void;
  onFreeRefill?: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  sessionCarrots,
  rewardTier,
  totalCarrots,
  highScore,
  isNewHigh,
  lives,
  onRetry,
  onOpenWardrobe,
  onBuyLife,
  onFreeRefill,
}) => {
  const router = useRouter();
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
              <MapPin className="w-4 h-4 text-white/50" /> Distance Reached
            </span>
            <span className="text-sm sm:text-base text-white">{score} pts</span>
          </div>

          {/* Carrots */}
          <div className="flex justify-between items-center text-xs sm:text-sm font-extrabold text-white/80">
            <span className="flex items-center gap-2">
              <Carrot className="w-4 h-4 text-brand-orange" /> Carrots Gathered ({sessionCarrots})
            </span>
            <span className="text-sm sm:text-base text-brand-orange">+{carrotBonusPoints} pts</span>
          </div>

          {/* Reward Tier Banner */}
          {rewardTier === 'guaranteed' && (
            <div className="flex items-center gap-3 bg-brand-purple/10 border border-brand-purple/30 rounded-xl px-3 py-2 mt-2">
              <Diamond className="w-5 h-5 text-brand-purple flex-shrink-0" />
              <div>
                <div className="text-[11px] font-black text-brand-purple">1/100 RARE — GUARANTEED REWARD UNLOCKED!</div>
                <div className="text-[10px] text-brand-purple/70 mt-0.5">9 Carrots collected. You qualify for a guaranteed reward!</div>
              </div>
            </div>
          )}
          {rewardTier === 'fcfs' && (
            <div className="flex items-center gap-3 bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-3 py-2 mt-2">
              <Zap className="w-5 h-5 text-brand-orange flex-shrink-0" />
              <div>
                <div className="text-[11px] font-black text-brand-orange">FCFS Reward Tier Qualified!</div>
                <div className="text-[10px] text-brand-orange/70 mt-0.5">5-8 Carrots collected. First-Come-First-Served reward slot!</div>
              </div>
            </div>
          )}
          {rewardTier === 'none' && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mt-2">
              <CircleDot className="w-5 h-5 text-white/30 flex-shrink-0" />
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
              New Record!
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
              <span>HOP AGAIN ({lives} left)</span>
            </button>
          ) : canAffordLife ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('carrot');
                onBuyLife();
              }}
              className="w-full py-4 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[56px] bg-brand-orange hover:bg-brand-orange-dark text-white shadow-[0_5px_0_var(--color-brand-orange-dark)] active:translate-y-1 active:shadow-[0_1px_0_var(--color-brand-orange-dark)] cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Refill Life ({EXTRA_LIFE_CARROT_COST} carrots)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('carrot');
                if (onFreeRefill) onFreeRefill();
                else onBuyLife();
              }}
              className="w-full py-4 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[56px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-[0_1px_0_#059669] cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Free Refill (+5 Lives)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            className="w-full py-3.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-extrabold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>Bunny Wardrobe ({totalCarrots} carrots)</span>
          </button>

          {/* Quit to Home */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-extrabold text-xs rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Home</span>
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
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      <div className="modal-container w-full max-w-sm text-center !p-6 sm:!p-8">
        <h2 className="text-3xl font-black text-white mb-2 font-bungee">Game Paused</h2>
        <p className="text-sm text-white/60 font-medium mb-6">Take a breather, hopper!</p>

        <div className="space-y-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onResume();
            }}
            className="btn-primary w-full py-3.5 text-lg min-h-[52px]"
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
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm rounded-xl border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[52px]"
          >
            <RotateCcw className="w-4 h-4 text-white/70" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onOpenWardrobe();
            }}
            className="w-full py-3 bg-brand-orange/20 hover:bg-brand-orange/30 text-amber-300 font-extrabold text-sm rounded-xl border border-brand-orange/40 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[52px]"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Bunny Wardrobe</span>
          </button>

          {/* Quit to Home */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-extrabold text-xs rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
