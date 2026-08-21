'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Sparkles, Trophy, Heart, Clock, PlusCircle } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { BUNNY_SKINS } from '@/lib/game/types';
import {
  MAX_DAILY_LIVES,
  EXTRA_LIFE_CARROT_COST,
  getRemainingTimeUntilMidnight,
} from '@/lib/game/livesManager';

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

  useEffect(() => {
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-b from-sky-400/40 via-sky-300/60 to-emerald-300/70 backdrop-blur-sm select-none animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Title */}
        <div className="inline-block px-4 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
          Carrot Bonanza Edition
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-pink-500 drop-shadow-[0_4px_0_rgba(255,224,122,1)] tracking-tight">
          🐰 Bunny Hop
        </h1>
        <p className="text-slate-600 text-sm font-semibold mt-2 mb-3 leading-relaxed">
          Hop across busy highways &amp; log-filled rivers. Harvest delicious carrots along the way!
        </p>

        {/* Daily Lives Display Box */}
        <div className="my-3 p-3 bg-rose-50/90 border-2 border-rose-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-black text-rose-400">Daily Free Lives</div>
              <div className="text-sm font-black text-rose-700">
                {lives} / {MAX_DAILY_LIVES} Remaining Today
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Resets in {timeLeft}</span>
          </div>
        </div>

        {/* Out of Lives Warning & Refill Action */}
        {isOutOfLives ? (
          <div className="my-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-2">
            <div className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
              <span>⚠️</span> Out of daily free lives!
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your 5 daily lives reset at midnight, or you can exchange {EXTRA_LIFE_CARROT_COST} 🥕 Carrots for +1 Extra Life now!
            </p>
            <button
              onClick={() => {
                soundEngine.playClick();
                onBuyLife();
              }}
              disabled={!canAffordLife}
              className={`w-full mt-2 py-2.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${
                canAffordLife
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
              onOpenWardrobe();
            }}
            className="mx-auto my-3 p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-95 group max-w-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl group-hover:scale-110 transition-transform">🐰</span>
              <div className="text-left">
                <div className="text-[10px] uppercase font-black text-slate-400">Equipped Skin</div>
                <div className="text-sm font-extrabold text-slate-800">{currentSkinObj.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-xl">
              <span>{totalCarrots} 🥕</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Play Button (disabled if 0 lives) */}
        <button
          onClick={() => {
            if (!isOutOfLives) {
              soundEngine.playClick();
              onStart();
            }
          }}
          disabled={isOutOfLives}
          className={`w-full mt-3 py-4 font-black text-2xl tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 group ${
            !isOutOfLives
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white shadow-[0_6px_0_#2b7a4b] active:translate-y-1 active:shadow-[0_2px_0_#2b7a4b] cursor-pointer'
              : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          <span>{isOutOfLives ? 'NO LIVES LEFT' : 'HOP IN & PLAY'}</span>
        </button>

        {/* Quick Instructions */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium space-y-1">
          <div className="flex items-center justify-center gap-2 text-slate-600 font-bold">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">WASD</span>
            <span>or</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">ARROWS</span>
            <span>or</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">SWIPE</span>
          </div>
          <p className="text-[11px] text-slate-400">⚡ Speed increases every 5s • Snag 🥕 carrots for extra lives &amp; skins!</p>
        </div>
      </div>
    </div>
  );
};

interface GameOverOverlayProps {
  score: number;
  sessionCarrots: number;
  goldenCarrots: number;
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
  goldenCarrots,
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
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [isNewHigh]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Title */}
        <div className="text-3xl sm:text-4xl font-black text-rose-500 tracking-tight">
          Oof! Squished!
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 mb-3">
          Here is your run harvest breakdown:
        </p>

        {/* Score Breakdown Card */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 my-2 text-left space-y-2">
          {/* Distance */}
          <div className="flex justify-between items-center text-sm font-extrabold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>🛣️</span> Distance Reached
            </span>
            <span className="text-base text-slate-900">{score} pts</span>
          </div>

          {/* Carrots */}
          <div className="flex justify-between items-center text-sm font-extrabold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>🥕</span> Carrots Gathered ({sessionCarrots})
            </span>
            <span className="text-base text-orange-600">+{carrotBonusPoints} pts</span>
          </div>

          {/* Golden Carrots Badge */}
          {goldenCarrots > 0 && (
            <div className="flex justify-between items-center text-xs font-black text-amber-700 bg-amber-100/80 px-2 py-1 rounded-lg">
              <span>✨ Golden Carrots Snagged</span>
              <span>{goldenCarrots}x Rare!</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200 pt-2 flex justify-between items-end">
            <span className="text-xs uppercase font-black tracking-wider text-slate-400">
              Total Run Score
            </span>
            <span className="text-3xl font-black text-emerald-600 leading-none">
              {totalRunScore}
            </span>
          </div>
        </div>

        {/* Lives Remaining Bar */}
        <div className="my-2.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs font-bold text-rose-800">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Daily Lives Remaining: {lives}/{MAX_DAILY_LIVES}</span>
          </div>
          {isOutOfLives && (
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-200 px-1.5 py-0.5 rounded">
              0 Left
            </span>
          )}
        </div>

        {/* High Score Banner */}
        <div className="my-2 flex items-center justify-between px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>High Score: {highScore}</span>
          </div>
          {isNewHigh && (
            <span className="text-[11px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
              🎉 New Record!
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          {!isOutOfLives ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onRetry();
              }}
              className="w-full py-3.5 bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-black text-xl tracking-wider uppercase rounded-2xl shadow-[0_5px_0_#2b7a4b] active:translate-y-1 active:shadow-[0_1px_0_#2b7a4b] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>HOP AGAIN ({lives} ❤️ Left)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                onBuyLife();
              }}
              disabled={!canAffordLife}
              className={`w-full py-3.5 font-black text-lg tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${
                canAffordLife
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-white shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-[0_1px_0_#b45309] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Refill +1 Life ({EXTRA_LIFE_CARROT_COST} 🥕)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenWardrobe();
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Bunny Wardrobe ({totalCarrots} 🥕 Bank)</span>
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-sm w-full p-6 text-center shadow-2xl">
        <h2 className="text-3xl font-black text-slate-800 mb-1">Game Paused</h2>
        <p className="text-xs text-slate-500 font-medium mb-6">Take a breather, hopper!</p>

        <div className="space-y-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Run</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenWardrobe();
            }}
            className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-sm rounded-2xl border border-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Bunny Wardrobe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
