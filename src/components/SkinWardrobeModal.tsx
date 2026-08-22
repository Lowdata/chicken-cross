'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Lock, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BUNNY_SKINS, BunnySkin } from '@/lib/game/types';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';

interface SkinWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCarrots: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
}

type FilterTab = 'all' | 'unlocked' | 'locked';

export const SkinWardrobeModal: React.FC<SkinWardrobeModalProps> = ({
  isOpen,
  onClose,
  totalCarrots,
  unlockedSkins,
  selectedSkin,
  onSelectSkin,
  onUnlockSkin,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');

  if (!isOpen) return null;

  const handleUnlock = (skin: BunnySkin) => {
    if (totalCarrots >= skin.cost) {
      soundEngine.playFanfare();
      triggerHaptic('fanfare');
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
    triggerHaptic('tap');
    onSelectSkin(skinId);
  };

  const allSkins = Object.values(BUNNY_SKINS);
  const filteredSkins = allSkins.filter((skin) => {
    const isUnlocked = unlockedSkins.includes(skin.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-xl w-full p-4 sm:p-7 shadow-2xl relative max-h-[88dvh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-800 flex items-center gap-1.5 sm:gap-2">
              <span>🐰</span> Bunny Wardrobe
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
              Snag carrots in runs to unlock awesome skins!
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onClose();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer flex-shrink-0"
            aria-label="Close Wardrobe"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Current Carrots Balance Bar */}
        <div className="my-2.5 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-inner flex-shrink-0">
          <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wider">
            Your Carrot Bank
          </span>
          <div className="flex items-center gap-1 font-black text-base sm:text-lg text-amber-950">
            <span>🥕</span>
            <span>{totalCarrots} Carrots</span>
          </div>
        </div>

        {/* Filter Tabs for Easy Mobile Navigation */}
        <div className="flex items-center gap-1.5 mb-2 pb-1 overflow-x-auto flex-shrink-0">
          {(['all', 'unlocked', 'locked'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                setFilter(tab);
              }}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all'
                ? `All (${allSkins.length})`
                : tab === 'unlocked'
                ? `Unlocked (${unlockedSkins.length})`
                : `Locked (${allSkins.length - unlockedSkins.length})`}
            </button>
          ))}
        </div>

        {/* Scrollable Skin Grid */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 my-1">
          {filteredSkins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = totalCarrots >= skin.cost;

            const hexBody = '#' + skin.colors.body.toString(16).padStart(6, '0');
            const hexEar = '#' + skin.colors.earInner.toString(16).padStart(6, '0');

            return (
              <div
                key={skin.id}
                className={`relative rounded-2xl p-3 sm:p-3.5 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400'
                    : isUnlocked
                    ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                    : 'border-slate-200/80 bg-slate-100/60 opacity-90'
                }`}
              >
                {/* Skin Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {/* Color Preview Swatch */}
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: hexBody }}
                      >
                        <div
                          className="w-3.5 h-5 rounded-full border border-white/60"
                          style={{ backgroundColor: hexEar }}
                        />
                        {skin.auraColor && (
                          <div className="absolute inset-0 ring-2 ring-amber-400 animate-pulse rounded-2xl" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight">
                            {skin.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-block text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
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

                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {skin.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  {isUnlocked ? (
                    isSelected ? (
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-1 py-1">
                        <Check className="w-4 h-4 stroke-[3]" /> EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelect(skin.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer min-h-[38px]"
                      >
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlock(skin)}
                      disabled={!canAfford}
                      className={`w-full py-2 flex items-center justify-center gap-1.5 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all min-h-[38px] ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 cursor-pointer shadow-amber-300/50 shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock ({skin.cost} 🥕)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer min-h-[42px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
