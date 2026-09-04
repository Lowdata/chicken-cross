'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Dices, RotateCcw, Check, Layers, X } from 'lucide-react';
import bunnyTraitsData from '@/data/bunnyTraits.json';

interface TraitItem {
  id: string;
  name: string;
  file: string;
  url: string;
}

interface TraitCategory {
  id: string;
  name: string;
  optional: boolean;
  default: string | null;
  items: TraitItem[];
}

type TraitsMap = Record<string, TraitCategory>;

const traitsData = bunnyTraitsData as unknown as TraitsMap;

export default function BunnyLabBuilder() {
  // Category slots matching Figma
  const categories = useMemo(() => [
    { id: 'aura', label: 'AURA / POWER EFFECT', count: traitsData.aura?.items.length || 0, icon: '✨' },
    { id: 'body', label: 'FUR / BODY', count: traitsData.body?.items.length || 0, icon: '🐰' },
    { id: 'hat', label: 'HEADWEARS', count: traitsData.hat?.items.length || 0, icon: '👑' },
    { id: 'clothing', label: 'CLOTHING', count: traitsData.clothing?.items.length || 0, icon: '🥋' },
    { id: 'item', label: 'HELD ITEMS', count: traitsData.item?.items.length || 0, icon: '🥕' },
  ], []);

  // Active category in Slot 1
  const [activeCategory, setActiveCategory] = useState<string>('item');

  // Equipped traits in Slot 3
  const [equipped, setEquipped] = useState<{
    aura: string | null;
    body: string;
    hat: string | null;
    clothing: string | null;
    item: string | null;
  }>({
    aura: 'Electric Spark Aura.png',
    body: 'Blush Pink.png',
    hat: 'Cowboy Hat.png',
    clothing: null,
    item: 'Carrot.png',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active items in Slot 2 based on activeCategory
  const currentCategoryData = traitsData[activeCategory];
  const currentItems = currentCategoryData?.items || [];

  // Handle equipping a trait
  const handleSelectTrait = (categoryId: string, file: string | null) => {
    setEquipped(prev => ({
      ...prev,
      [categoryId]: file,
    }));
  };

  // Clear all optional traits
  const handleClearAll = () => {
    setEquipped({
      aura: null,
      body: 'Blush Pink.png',
      hat: null,
      clothing: null,
      item: null,
    });
  };

  // Randomize all traits
  const handleRandomize = () => {
    const randomItem = (items: TraitItem[]) => {
      if (!items || items.length === 0) return null;
      const idx = Math.floor(Math.random() * items.length);
      return items[idx].file;
    };

    setEquipped({
      aura: Math.random() > 0.2 ? randomItem(traitsData.aura?.items || []) : null,
      body: randomItem(traitsData.body?.items || []) || 'Blush Pink.png',
      hat: Math.random() > 0.2 ? randomItem(traitsData.hat?.items || []) : null,
      clothing: Math.random() > 0.4 ? randomItem(traitsData.clothing?.items || []) : null,
      item: Math.random() > 0.3 ? randomItem(traitsData.item?.items || []) : null,
    });
  };

  // Save build trigger with confetti
  const handleSaveBuild = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF58B8', '#B794F4', '#68D391', '#F6E05E', '#FFFFFF'],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Helpers to get item names
  const getTraitName = (file: string | null) => {
    if (!file) return 'empty';
    return file.replace('.png', '');
  };

  const activeLayerCount = [
    equipped.aura,
    equipped.body,
    equipped.clothing,
    equipped.hat,
    equipped.item,
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 3-Panel Responsive Customizer Grid matching exact Figma Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* ── PANEL 1: CHOOSE A SLOT ── */}
        <div className="lg:col-span-3 flex flex-col rounded-[22px] bg-gradient-to-b from-[#8a63e8] to-[#5c34c9] p-4 border-[1.5px] border-white/85 shadow-[0_20px_50px_rgba(40,15,80,0.35)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm">
              1 · CHOOSE A SLOT
            </div>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white/90 font-dm-mono text-[10px] font-bold tracking-wider transition-colors cursor-pointer border border-white/20"
            >
              CLEAR ALL
            </button>
          </div>

          {/* Slot Rows List */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[540px] pr-1 custom-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const equippedVal = equipped[cat.id as keyof typeof equipped];
              const isEquipped = !!equippedVal;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left p-2.5 rounded-[14px] transition-all flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-[#1c1140] text-white border-2 border-[#FF58B8] shadow-[0_4px_20px_rgba(255,88,184,0.4)] scale-[1.02]'
                      : 'bg-gradient-to-b from-white to-[#f2ecfd] text-[#241444] border border-white/90 hover:brightness-105 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <div className="flex flex-col truncate">
                      <span className={`font-bungee text-[11px] tracking-wide leading-tight truncate ${
                        isActive ? 'text-white' : 'text-[#241444]'
                      }`}>
                        {cat.label}
                      </span>
                      <span className={`text-[10px] font-dm-mono font-medium truncate ${
                        isActive 
                          ? 'text-[#FF58B8] font-bold' 
                          : isEquipped 
                            ? 'text-purple-700 font-bold' 
                            : 'text-gray-400'
                      }`}>
                        {getTraitName(equippedVal)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button / Status indicator */}
                  {isEquipped && cat.id !== 'body' && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTrait(cat.id, null);
                      }}
                      className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      title="Clear trait"
                    >
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PANEL 2: PICK A TRAIT ── */}
        <div className="lg:col-span-5 flex flex-col rounded-[22px] bg-gradient-to-b from-[#ff59b0] to-[#d31e83] p-4 border-[1.5px] border-white/85 shadow-[0_20px_50px_rgba(180,20,90,0.35)] min-h-[500px]">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm truncate max-w-[280px]">
              2 · PICK A TRAIT · {currentCategoryData?.name || ''}
            </div>
            <span className="font-dm-mono text-[11px] text-white/90 font-bold tracking-wider shrink-0">
              {currentItems.length} options
            </span>
          </div>

          {/* Grid of White Cards (matching Figma) */}
          <div className="grid grid-cols-4 gap-2.5 overflow-y-auto max-h-[520px] p-1 custom-scrollbar">
            {/* "None" option if optional */}
            {currentCategoryData?.optional && (
              <button
                onClick={() => handleSelectTrait(activeCategory, null)}
                className={`bg-white rounded-[16px] p-2 flex flex-col items-center justify-between aspect-[3/4] transition-all cursor-pointer shadow-md hover:scale-105 ${
                  equipped[activeCategory as keyof typeof equipped] === null
                    ? 'ring-3 ring-[#1c1140] border-2 border-[#1c1140]'
                    : 'border border-gray-100 hover:shadow-lg'
                }`}
              >
                <div className="w-full flex-1 flex items-center justify-center text-gray-300 font-dm-mono text-2xl">
                  Ø
                </div>
                <span className="font-dm-mono text-[10px] text-[#241444] font-bold uppercase tracking-wider text-center line-clamp-1 w-full mt-1">
                  None
                </span>
              </button>
            )}

            {/* Trait Cards */}
            {currentItems.map((item) => {
              const isSelected = equipped[activeCategory as keyof typeof equipped] === item.file;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTrait(activeCategory, item.file)}
                  className={`relative bg-white rounded-[16px] p-2 flex flex-col items-center justify-between aspect-[3/4] transition-all cursor-pointer shadow-md hover:scale-105 overflow-hidden group ${
                    isSelected
                      ? 'ring-3 ring-[#1c1140] border-2 border-[#1c1140] shadow-xl'
                      : 'border border-gray-100 hover:shadow-lg'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1c1140] flex items-center justify-center text-white text-[8px] z-10 shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                    />
                  </div>

                  {/* Name Label */}
                  <span className="font-dm-mono text-[10px] text-[#241444] font-bold leading-tight text-center line-clamp-2 w-full mt-1 px-0.5">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PANEL 3: LIVE DRAFT (GLASS TONE) ── */}
        <div className="lg:col-span-4 flex flex-col rounded-[22px] bg-gradient-to-b from-[#8a63e8] to-[#5c34c9] p-4 border-[1.5px] border-white/85 shadow-[0_20px_50px_rgba(40,15,80,0.35)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm">
              GLASS TONE
            </div>
            <span className="font-dm-mono text-[11px] text-white/90 font-bold tracking-wider">
              {activeLayerCount} LAYERS
            </span>
          </div>

          {/* Character Stage (Surface Container matching Figma) */}
          <div className="relative w-full aspect-square rounded-[18px] bg-gradient-to-b from-[#F2ECFD] to-[#DFD4F8] border border-white/80 overflow-hidden shadow-inner flex items-center justify-center group">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-[#B794F4]/20 pointer-events-none" />

            {/* Subtle rotating holographic halo */}
            <div className="absolute w-[86%] h-[86%] rounded-full border border-purple-300/30 animate-spin-slow pointer-events-none" />

            {/* ── 3+ LAYER STACK: ALL 2048x2048 PNGS SYNCHRONIZED ── */}
            <div className="relative w-full h-full p-2 flex items-center justify-center">
              
              {/* Layer 1: Aura (Power Effect) */}
              {equipped.aura && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pong/Aura - Power Effect /${equipped.aura}`}
                  alt="Aura"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 filter drop-shadow-[0_0_20px_rgba(255,220,255,0.7)] animate-pulse-slow"
                />
              )}

              {/* Layer 2: Fur / Body */}
              {equipped.body && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pong/Fur - Body/${equipped.body}`}
                  alt="Body"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                />
              )}

              {/* Layer 3: Clothing */}
              {equipped.clothing && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pong/Clothing/${equipped.clothing}`}
                  alt="Clothing"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-25 drop-shadow-md"
                />
              )}

              {/* Layer 4: Headwear / Hat */}
              {equipped.hat && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pong/Headwears/${equipped.hat}`}
                  alt="Headwear"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 drop-shadow-lg"
                />
              )}

              {/* Layer 5: Held Item */}
              {equipped.item && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pong/Held Items/${equipped.item}`}
                  alt="Held Item"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-35 drop-shadow-lg"
                />
              )}

            </div>
          </div>

          {/* Info Tag Bar (matching Figma) */}
          <div className="mt-3 bg-[#eceaf6] rounded-[14px] px-3.5 py-2.5 border border-white/80 shadow-sm">
            <p className="font-dm-mono text-[11px] text-[#3a3a48] font-bold truncate leading-tight">
              BODY: <span className="text-[#8a63e8]">{getTraitName(equipped.body)}</span>
              {equipped.hat && <> · HAT: <span className="text-[#d31e83]">{getTraitName(equipped.hat)}</span></>}
              {equipped.aura && <> · AURA: <span className="text-purple-900">{getTraitName(equipped.aura)}</span></>}
            </p>
          </div>

          {/* Action Buttons matching Figma Pill Layout */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-1">
            <button
              onClick={handleSaveBuild}
              className="w-full py-2.5 px-3 rounded-full bg-white/90 hover:bg-white text-[#241444] font-bungee text-[11px] tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff59b0]" />
              {savedSuccess ? 'SAVED!' : 'SAVE BUILD'}
            </button>

            <button
              onClick={handleRandomize}
              className="w-full py-2.5 px-3 rounded-full bg-white/90 hover:bg-white text-[#241444] font-bungee text-[11px] tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Dices className="w-3.5 h-3.5 text-[#8a63e8]" />
              RANDOMIZE
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
