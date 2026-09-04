'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Dices, 
  RotateCcw, 
  Check, 
  X, 
  Layers, 
  SlidersHorizontal,
  User,
  Smile,
  Eye,
  Shirt,
  Swords
} from 'lucide-react';
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
    { id: 'body', slotNum: '01', label: 'BODY', sublabel: 'Base Fur', icon: User, optional: false },
    { id: 'face', slotNum: '02', label: 'FACE', sublabel: 'Mood & Face', icon: Smile, optional: true },
    { id: 'eyes', slotNum: '03', label: 'EYES', sublabel: 'Eye Style', icon: Eye, optional: true },
    { id: 'clothes', slotNum: '04', label: 'CLOTHES', sublabel: 'Outfit', icon: Shirt, optional: true },
    { id: 'item', slotNum: '05', label: 'HELD ITEM', sublabel: 'Hand Item', icon: Swords, optional: true },
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

  // Reset to default look
  const handleResetDefault = () => {
    setEquipped({
      body: 'Blush_Pink.webp',
      face: 'Blush_Cheeks.webp',
      eyes: 'Default_Round.webp',
      clothes: 'Basic_Hoodie.webp',
      item: 'Carrot.webp',
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
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FF58B8', '#B794F4', '#68D391', '#F6E05E', '#FFFFFF'],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Helpers to get item display name
  const getTraitDisplayName = (catId: string, file: string | null) => {
    if (!file) return 'None';
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

  const activeCatObj = categories.find(c => c.id === activeCategory);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ── UNIFIED MODERN CUSTOMIZER STUDIO CHASSIS ── */}
      <div className="rounded-[28px] md:rounded-[36px] bg-gradient-to-b from-[#24124c]/95 via-[#1b0d3a]/95 to-[#120829]/98 p-4 sm:p-6 md:p-8 border-2 border-white/20 shadow-[0_30px_90px_rgba(15,5,35,0.6)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#FF58B8]/20 via-[#8a63e8]/10 to-transparent blur-2xl pointer-events-none" />

        {/* ── TOP BAR: STUDIO HEADER & ACTIONS ── */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 md:pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF58B8] to-[#8a63e8] flex items-center justify-center shadow-[0_0_20px_rgba(255,88,184,0.5)] border border-white/40">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bungee text-sm md:text-base text-white tracking-wider">
                  BOUNCE WORKBENCH
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF58B8]/25 text-[#FF9AD6] border border-[#FF58B8]/40 font-dm-mono font-bold tracking-wide">
                  v2.0
                </span>
              </div>
              <p className="font-dm-mono text-[11px] text-purple-200/70">
                Live interactive character builder · 5 curated options per layer
              </p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefault}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white font-dm-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer border border-white/15 flex items-center gap-1.5 shadow-sm"
              title="Reset to default traits"
            >
              <RotateCcw className="w-3 h-3" />
              RESET
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white font-dm-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer border border-white/15 flex items-center gap-1.5 shadow-sm"
              title="Clear all optional traits"
            >
              <X className="w-3 h-3 text-red-400" />
              CLEAR
            </button>
          </div>
        </div>

        {/* ── SLOT 1: MODERN LUXURY GEAR CAPSULES ── */}
        <div className="relative z-10 pt-4 md:pt-6 pb-5">
          <div className="text-[11px] font-dm-mono font-bold text-purple-300/80 mb-3 flex items-center justify-between">
            <span className="tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF58B8] animate-pulse" />
              SLOT SELECTION · CHOOSE LAYER TO CUSTOMIZE
            </span>
            <span className="text-[#FF9AD6] bg-[#FF58B8]/15 px-2.5 py-0.5 rounded-full border border-[#FF58B8]/30">
              {activeLayerCount} / 5 Equipped
            </span>
          </div>

          {/* Modern Tactical Gear Capsule Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const equippedVal = equipped[cat.id as keyof typeof equipped];
              const isEquipped = !!equippedVal;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group relative p-3 rounded-[20px] transition-all duration-200 flex flex-col items-start justify-between min-h-[92px] cursor-pointer text-left overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-[#FF58B8] via-[#df43a4] to-[#8a63e8] text-white shadow-[0_10px_28px_rgba(255,88,184,0.45)] scale-[1.03] border-2 border-white/90 ring-4 ring-[#FF58B8]/25'
                      : isEquipped
                        ? 'bg-white/[0.08] hover:bg-white/[0.14] text-purple-100 hover:text-white border border-white/20 hover:border-white/40 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-purple-300/60 hover:text-purple-200 border border-dashed border-white/15 hover:border-white/30'
                  }`}
                >
                  {/* Subtle Shimmer Overlay on Active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20 pointer-events-none" />
                  )}

                  {/* Top Row: Slot Tag & Icon */}
                  <div className="w-full flex items-center justify-between mb-1 relative z-10">
                    <span className={`text-[9px] font-dm-mono font-bold tracking-widest px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-black/25 text-white' 
                        : 'bg-white/10 text-purple-300'
                    }`}>
                      {cat.slotNum}
                    </span>

                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-white text-[#d31e83] shadow-md scale-110' 
                        : isEquipped
                          ? 'bg-white/15 text-white group-hover:scale-110'
                          : 'bg-white/5 text-purple-400/60'
                    }`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Middle: Category Label */}
                  <div className="relative z-10 mt-0.5">
                    <div className={`font-bungee text-xs md:text-sm tracking-wide leading-tight ${
                      isActive ? 'text-white' : 'text-white/90'
                    }`}>
                      {cat.label}
                    </div>
                  </div>

                  {/* Bottom: Current Equipped State Badge */}
                  <div className="w-full flex items-center gap-1.5 mt-1.5 relative z-10">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive 
                        ? 'bg-white shadow-[0_0_6px_#fff]' 
                        : isEquipped 
                          ? 'bg-[#68D391] shadow-[0_0_6px_#68D391]' 
                          : 'bg-white/20'
                    }`} />
                    <span className={`text-[10px] font-dm-mono font-semibold truncate leading-none ${
                      isActive 
                        ? 'text-white/95 font-bold' 
                        : isEquipped 
                          ? 'text-[#C9B3F7]' 
                          : 'text-purple-300/40'
                    }`}>
                      {isEquipped ? getTraitDisplayName(cat.id, equippedVal) : 'None'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN WORKSPACE: TRAIT PICKER (LEFT) + LIVE STAGE (RIGHT) ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch pt-1">
          
          {/* ── PANEL 2: PICK A TRAIT GRID (7 COLS ON DESKTOP) ── */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[24px] bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-4 sm:p-5 border border-white/15 backdrop-blur-md shadow-inner">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  {activeCatObj && (
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FF9AD6]">
                      <activeCatObj.icon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-bungee text-xs md:text-sm text-white tracking-wider">
                    2 · {activeCatObj?.label} OPTIONS
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 font-dm-mono text-[10px] font-bold tracking-wider">
                  5 CURATED CHOICES
                </span>
              </div>

              {/* Trait Cards Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Optional "None" Card */}
                {activeCatObj?.optional && (
                  <button
                    onClick={() => handleSelectTrait(activeCategory, null)}
                    className={`rounded-[18px] p-2.5 flex flex-col items-center justify-between aspect-square transition-all duration-200 cursor-pointer group ${
                      equipped[activeCategory as keyof typeof equipped] === null
                        ? 'bg-white text-[#1c1140] ring-4 ring-[#FF58B8] shadow-[0_0_25px_rgba(255,88,184,0.45)] scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 hover:border-white/30'
                    }`}
                  >
                    <div className="w-full flex-1 flex items-center justify-center text-3xl font-bold font-dm-mono opacity-60 group-hover:scale-110 transition-transform">
                      Ø
                    </div>
                    <span className="font-dm-mono text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1 w-full mt-1">
                      None
                    </span>
                  </button>
                )}

                {/* 5 Curated Trait Cards */}
                {currentItems.map((item) => {
                  const isSelected = equipped[activeCategory as keyof typeof equipped] === item.file;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTrait(activeCategory, item.file)}
                      className={`relative rounded-[18px] p-2 flex flex-col items-center justify-between aspect-square transition-all duration-200 cursor-pointer group overflow-hidden ${
                        isSelected
                          ? 'bg-white text-[#1c1140] ring-4 ring-[#FF58B8] shadow-[0_0_25px_rgba(255,88,184,0.45)] scale-[1.02]'
                          : 'bg-white/90 hover:bg-white text-[#241444] border border-white/80 shadow-md hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF58B8] flex items-center justify-center text-white text-[9px] z-10 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Image Thumbnail */}
                      <div className="w-full flex-1 flex items-center justify-center overflow-hidden pt-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                        />
                      </div>

                      {/* Name Label */}
                      <span className="font-dm-mono text-[10px] font-bold leading-tight text-center line-clamp-1 w-full mt-1 px-0.5 text-[#241444]">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-dm-mono text-purple-200/60">
              <span>TAP ANY CARD TO EQUIP</span>
              <span className="text-[#FF58B8] font-bold">100% ONCHAIN READY</span>
            </div>
          </div>

          {/* ── PANEL 3: LIVE DRAFT STAGE (5 COLS ON DESKTOP) ── */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[24px] bg-gradient-to-b from-[#8a63e8]/30 to-[#5c34c9]/40 p-4 sm:p-5 border border-white/20 backdrop-blur-md shadow-xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15">
                <div className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bungee text-[11px] tracking-wider border border-white/30 shadow-sm">
                  3 · GLASS TONE STAGE
                </div>
                <span className="font-dm-mono text-[11px] text-white/90 font-bold tracking-wider">
                  {activeLayerCount} LAYERS
                </span>
              </div>

              {/* Character Spotlight Stage */}
              <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-[22px] bg-gradient-to-b from-[#F4EFFF] to-[#DFD3F8] border-2 border-white/90 overflow-hidden shadow-inner flex items-center justify-center group">
                {/* Ambient Radial Backlight Glow */}
                <div className="absolute inset-0 bg-radial from-white/50 via-transparent to-[#B794F4]/30 pointer-events-none" />

                {/* Subtle Rotating Holographic Ring */}
                <div className="absolute w-[88%] h-[88%] rounded-full border border-purple-300/40 animate-spin-slow pointer-events-none" />

                {/* ── 5 LAYER STACK (ALL LOADED FROM /compressed/traits/) ── */}
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  
                  {/* Layer 1: Body (Base) */}
                  {equipped.body && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/compressed/traits/body/${equipped.body}`}
                      alt="Body"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
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

              {/* Trait Readout Capsule */}
              <div className="mt-3 bg-white/90 backdrop-blur-md rounded-[14px] px-3.5 py-2 border border-white shadow-sm">
                <p className="font-dm-mono text-[10px] text-[#241444] font-bold truncate leading-tight">
                  BODY: <span className="text-[#8a63e8]">{getTraitDisplayName('body', equipped.body)}</span>
                  {equipped.face && <> · FACE: <span className="text-[#d31e83]">{getTraitDisplayName('face', equipped.face)}</span></>}
                  {equipped.eyes && <> · EYES: <span className="text-purple-700">{getTraitDisplayName('eyes', equipped.eyes)}</span></>}
                  {equipped.clothes && <> · FIT: <span className="text-indigo-900">{getTraitDisplayName('clothes', equipped.clothes)}</span></>}
                  {equipped.item && <> · ITEM: <span className="text-pink-600">{getTraitDisplayName('item', equipped.item)}</span></>}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-3 pt-1">
              <button
                onClick={handleSaveBuild}
                className="figma-btn-hero w-full py-3 px-3 rounded-full text-[#241444] font-bungee text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(255,88,184,0.35)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff59b0]" />
                {savedSuccess ? 'SAVED!' : 'SAVE BUILD'}
              </button>

              <button
                onClick={handleRandomize}
                className="figma-btn-hero w-full py-3 px-3 rounded-full text-[#241444] font-bungee text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(138,99,232,0.35)]"
              >
                <Dices className="w-3.5 h-3.5 text-[#8a63e8]" />
                RANDOMIZE
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
