'use client';

import React from 'react';
import { X, Sparkles, Check, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BUNNY_SKINS, BunnySkin } from '@/lib/game/types';
import { soundEngine } from '@/lib/game/soundEngine';

interface SkinWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCarrots: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
}

export const SkinWardrobeModal: React.FC<SkinWardrobeModalProps> = ({
  isOpen,
  onClose,
  totalCarrots,
  unlockedSkins,
  selectedSkin,
  onSelectSkin,
  onUnlockSkin,
}) => {
  if (!isOpen) return null;

  const handleUnlock = (skin: BunnySkin) => {
    if (totalCarrots >= skin.cost) {
      soundEngine.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9900', '#ffd700', '#00e5ff', '#ff007f'],
      });
      onUnlockSkin(skin.id, skin.cost);
      onSelectSkin(skin.id);
    }
  };

  const handleSelect = (skinId: string) => {
    soundEngine.playClick();
    onSelectSkin(skinId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>🐰</span> Bunny Wardrobe
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Collect carrots in your runs to unlock stylish hopper skins!
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            aria-label="Close Wardrobe"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Current Carrots Balance */}
        <div className="my-4 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-inner">
          <span className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider">
            Your Carrot Bank
          </span>
          <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl text-amber-950">
            <span className="text-xl">🥕</span>
            <span>{totalCarrots} Carrots</span>
          </div>
        </div>

        {/* Skin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
          {Object.values(BUNNY_SKINS).map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = totalCarrots >= skin.cost;

            const hexBody = '#' + skin.colors.body.toString(16).padStart(6, '0');
            const hexEar = '#' + skin.colors.earInner.toString(16).padStart(6, '0');

            return (
              <div
                key={skin.id}
                className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                    : isUnlocked
                    ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                    : 'border-slate-200/80 bg-slate-100/60 opacity-90'
                }`}
              >
                {/* Skin Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Color Preview Swatch */}
                      <div
                        className="w-12 h-12 rounded-2xl border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: hexBody }}
                      >
                        <div
                          className="w-4 h-6 rounded-full border border-white/60"
                          style={{ backgroundColor: hexEar }}
                        />
                        {skin.auraColor && (
                          <div className="absolute inset-0 ring-2 ring-amber-400 animate-pulse rounded-2xl" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-800 text-base">{skin.name}</h3>
                        </div>
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            skin.tag === 'Classic'
                              ? 'bg-slate-200 text-slate-700'
                              : skin.tag === 'Rare'
                              ? 'bg-amber-100 text-amber-800'
                              : skin.tag === 'Epic'
                              ? 'bg-purple-100 text-purple-800'
                              : skin.tag === 'Legendary'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {skin.tag || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {skin.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  {isUnlocked ? (
                    isSelected ? (
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" /> EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelect(skin.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlock(skin)}
                      disabled={!canAfford}
                      className={`w-full py-2 flex items-center justify-center gap-1.5 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 cursor-pointer shadow-amber-300/50 shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock for {skin.cost} 🥕</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
