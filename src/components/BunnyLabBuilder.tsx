'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Dices, RotateCcw, Check, X, Layers } from 'lucide-react';
import compressedData from '@/data/compressedTraits.json';

interface TraitItem {
  id: string;
  name: string;
  file: string;
  url: string;
  orig_size_kb: number;
  comp_size_kb: number;
}

type TraitsManifest = Record<string, TraitItem[]>;

const traitsManifest = compressedData as unknown as TraitsManifest;

export default function BunnyLabBuilder() {
  // 5 categories: Body, Face, Eyes, Clothes, Hand held item
  const categories = useMemo(() => [
    { id: 'body', label: 'BODY', icon: '🐰', optional: false },
    { id: 'face', label: 'FACE', icon: '😊', optional: true },
    { id: 'eyes', label: 'EYES', icon: '👀', optional: true },
    { id: 'clothes', label: 'CLOTHES', icon: '🥋', optional: true },
    { id: 'item', label: 'HAND HELD ITEM', icon: '🥕', optional: true },
  ], []);

  // Active category in Slot 1
  const [activeCategory, setActiveCategory] = useState<string>('body');

  // Equipped traits in Slot 3 (each category has 5 options)
  const [equipped, setEquipped] = useState<{
    body: string;
    face: string | null;
    eyes: string | null;
    clothes: string | null;
    item: string | null;
  }>({
    body: 'Blush_Pink.webp',
    face: 'Blush_Cheeks.webp',
    eyes: 'Default_Round.webp',
    clothes: 'Basic_Hoodie.webp',
    item: 'Carrot.webp',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // 5 options for the currently selected category
  const currentItems = traitsManifest[activeCategory] || [];

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
      body: 'Blush_Pink.webp',
      face: null,
      eyes: null,
      clothes: null,
      item: null,
    });
  };

  // Randomize among the 5 options for each category
  const handleRandomize = () => {
    const randomPick = (items: TraitItem[]) => {
      if (!items || items.length === 0) return null;
      const idx = Math.floor(Math.random() * items.length);
      return items[idx].file;
    };

    setEquipped({
      body: randomPick(traitsManifest.body) || 'Blush_Pink.webp',
      face: Math.random() > 0.15 ? randomPick(traitsManifest.face) : null,
      eyes: Math.random() > 0.1 ? randomPick(traitsManifest.eyes) : null,
      clothes: Math.random() > 0.25 ? randomPick(traitsManifest.clothes) : null,
      item: Math.random() > 0.25 ? randomPick(traitsManifest.item) : null,
    });
  };

  // Save build with confetti
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

  // Helpers to get item display name
  const getTraitDisplayName = (catId: string, file: string | null) => {
    if (!file) return 'empty';
    const item = (traitsManifest[catId] || []).find(i => i.file === file);
    return item ? item.name : file.replace('.webp', '').replace(/_/g, ' ');
  };

  const activeLayerCount = [
    equipped.body,
    equipped.face,
    equipped.eyes,
    equipped.clothes,
    equipped.item,
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden">
      {/* 3-Panel Responsive Customizer Grid matching exact Figma Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* ── PANEL 1: CHOOSE A SLOT (5 CATEGORIES) ── */}
        <div className="lg:col-span-3 flex flex-col justify-between rounded-[22px] bg-gradient-to-b from-[#8a63e8] to-[#5c34c9] p-4 border-[1.5px] border-white/85 shadow-[0_15px_40px_rgba(40,15,80,0.3)]">
          <div>
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
              <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm">
                1 · CHOOSE A SLOT
              </div>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white/90 font-dm-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer border border-white/20"
              >
                CLEAR ALL
              </button>
            </div>

            {/* 5 Category Rows */}
            <div className="flex flex-col gap-2">
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
                        ? 'bg-[#1c1140] text-white border-2 border-[#FF58B8] shadow-[0_4px_18px_rgba(255,88,184,0.4)] scale-[1.02]'
                        : 'bg-gradient-to-b from-white to-[#f4effd] text-[#241444] border border-white/90 hover:brightness-105 shadow-sm hover:scale-[1.01]'
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
                          {getTraitDisplayName(cat.id, equippedVal)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Clear Button */}
                    {isEquipped && cat.optional && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTrait(cat.id, null);
                        }}
                        className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                        title="Clear slot"
                      >
                        <X className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-dm-mono text-purple-200/75">
            <span>SLOTS: 5 TRAITS</span>
            <span className="text-[#FF58B8] font-bold">5 CHOICES EACH</span>
          </div>
        </div>

        {/* ── PANEL 2: PICK A TRAIT (5 OPTIONS + NONE) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-[22px] bg-gradient-to-b from-[#ff59b0] to-[#d31e83] p-4 border-[1.5px] border-white/85 shadow-[0_15px_40px_rgba(180,20,90,0.3)]">
          <div>
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
              <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm truncate max-w-[280px]">
                2 · PICK A TRAIT · {categories.find(c => c.id === activeCategory)?.label}
              </div>
              <span className="font-dm-mono text-[11px] text-white/90 font-bold tracking-wider shrink-0">
                5 options
              </span>
            </div>

            {/* Clean 3-Column Grid for options - Fits naturally without blank gap */}
            <div className="grid grid-cols-3 gap-2.5 p-0.5">
              {/* "None" option for optional categories */}
              {categories.find(c => c.id === activeCategory)?.optional && (
                <button
                  onClick={() => handleSelectTrait(activeCategory, null)}
                  className={`bg-white rounded-[14px] p-2 flex flex-col items-center justify-between aspect-square transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                    equipped[activeCategory as keyof typeof equipped] === null
                      ? 'ring-3 ring-[#1c1140] border-2 border-[#1c1140] shadow-md'
                      : 'border border-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="w-full flex-1 flex items-center justify-center text-gray-300 font-dm-mono text-2xl font-bold">
                    Ø
                  </div>
                  <span className="font-dm-mono text-[10px] text-[#241444] font-bold uppercase tracking-wider text-center line-clamp-1 w-full mt-1">
                    None
                  </span>
                </button>
              )}

              {/* 5 Trait Cards */}
              {currentItems.map((item) => {
                const isSelected = equipped[activeCategory as keyof typeof equipped] === item.file;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTrait(activeCategory, item.file)}
                    className={`relative bg-white rounded-[14px] p-2 flex flex-col items-center justify-between aspect-square transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 overflow-hidden group ${
                      isSelected
                        ? 'ring-3 ring-[#1c1140] border-2 border-[#1c1140] shadow-md'
                        : 'border border-gray-100 hover:shadow-md'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1c1140] flex items-center justify-center text-white text-[8px] z-10 shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Image Thumbnail from /compressed/traits/ */}
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

          <div className="pt-2 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-dm-mono text-white/70">
            <span>ACTIVE: {categories.find(c => c.id === activeCategory)?.label}</span>
            <span className="text-white font-bold">CLICK TO EQUIP</span>
          </div>
        </div>

        {/* ── PANEL 3: LIVE DRAFT (GLASS TONE) ── */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-[22px] bg-gradient-to-b from-[#8a63e8] to-[#5c34c9] p-4 border-[1.5px] border-white/85 shadow-[0_15px_40px_rgba(40,15,80,0.3)]">
          <div>
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
              <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm">
                GLASS TONE
              </div>
              <span className="font-dm-mono text-[11px] text-white/90 font-bold tracking-wider">
                {activeLayerCount} LAYERS
              </span>
            </div>

            {/* Character Stage (Surface Container matching Figma) */}
            <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-[18px] bg-gradient-to-b from-[#F2ECFD] to-[#DFD4F8] border border-white/80 overflow-hidden shadow-inner flex items-center justify-center group">
              {/* Ambient Backlight Glow */}
              <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-[#B794F4]/20 pointer-events-none" />

              {/* Subtle rotating holographic halo */}
              <div className="absolute w-[86%] h-[86%] rounded-full border border-purple-300/30 animate-spin-slow pointer-events-none" />

              {/* ── 5 LAYER STACK: ALL LOADED FROM /compressed/traits/ ── */}
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                
                {/* Layer 1: Body (Base) */}
                {equipped.body && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/compressed/traits/body/${equipped.body}`}
                    alt="Body"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                  />
                )}

                {/* Layer 2: Face (Mouth / Cheeks / Expression) */}
                {equipped.face && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/compressed/traits/face/${equipped.face}`}
                    alt="Face"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-15 drop-shadow-sm"
                  />
                )}

                {/* Layer 3: Eyes */}
                {equipped.eyes && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/compressed/traits/eyes/${equipped.eyes}`}
                    alt="Eyes"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 drop-shadow-md"
                  />
                )}

                {/* Layer 4: Clothes */}
                {equipped.clothes && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/compressed/traits/clothes/${equipped.clothes}`}
                    alt="Clothes"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 drop-shadow-lg"
                  />
                )}

                {/* Layer 5: Hand held item */}
                {equipped.item && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/compressed/traits/item/${equipped.item}`}
                    alt="Hand held item"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40 drop-shadow-xl"
                  />
                )}

              </div>
            </div>

            {/* Info Tag Bar */}
            <div className="mt-3 bg-[#eceaf6] rounded-[12px] px-3 py-1.5 border border-white/80 shadow-sm">
              <p className="font-dm-mono text-[10px] text-[#3a3a48] font-bold truncate leading-tight">
                BODY: <span className="text-[#8a63e8]">{getTraitDisplayName('body', equipped.body)}</span>
                {equipped.face && <> · FACE: <span className="text-[#d31e83]">{getTraitDisplayName('face', equipped.face)}</span></>}
                {equipped.eyes && <> · EYES: <span className="text-purple-700">{getTraitDisplayName('eyes', equipped.eyes)}</span></>}
                {equipped.clothes && <> · FIT: <span className="text-indigo-900">{getTraitDisplayName('clothes', equipped.clothes)}</span></>}
              </p>
            </div>
          </div>

          {/* Action Buttons matching Figma Pill Layout */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-1">
            <button
              onClick={handleSaveBuild}
              className="figma-btn-hero w-full py-2.5 px-3 rounded-full text-[#241444] font-bungee text-[11px] tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff59b0]" />
              {savedSuccess ? 'SAVED!' : 'SAVE BUILD'}
            </button>

            <button
              onClick={handleRandomize}
              className="figma-btn-hero w-full py-2.5 px-3 rounded-full text-[#241444] font-bungee text-[11px] tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
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
