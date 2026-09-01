'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ChevronRight
} from 'lucide-react';

/* ── Custom Social Icons ── */
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.128c-.598.344-1.22.64-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

/* ── Trait Builder Options ── */
const TRAIT_CATEGORIES = [
  { id: 'head', name: 'HEADWEAR' },
  { id: 'eyes', name: 'EYES' },
  { id: 'outfit', name: 'OUTFIT' },
  { id: 'hand', name: 'HAND ITEM' },
  { id: 'background', name: 'BACKGROUND' },
];

const TRAIT_ITEMS = {
  head: [
    { id: 'crown', name: 'Golden Crown', rarity: 'Legendary', img: '/images/stk_galaxy.png' },
    { id: 'beanie', name: 'Propeller Beanie', rarity: 'Rare', img: '/images/stk_boombox.png' },
    { id: 'cap', name: 'Newsboy Cap', rarity: 'Common', img: '/images/stk_carrot.png' }
  ],
  eyes: [
    { id: 'hypno', name: 'Spiral Hypno', rarity: 'Epic', img: '/images/stk_galaxy.png' },
    { id: 'sunglasses', name: 'Mirrored Holo', rarity: 'Rare', img: '/images/stk_boombox.png' },
    { id: 'flat', name: 'Flat Line (-_-)', rarity: 'Common', img: '/images/stk_carrot.png' }
  ],
  outfit: [
    { id: 'suit', name: 'Classy Suit & Tie', rarity: 'Legendary', img: '/images/stk_boombox.png' },
    { id: 'kilt', name: 'Kilt Wrap', rarity: 'Rare', img: '/images/stk_carrot.png' },
    { id: 'plush', name: 'Plush Toy Stitching', rarity: 'Common', img: '/images/stk_galaxy.png' }
  ],
  hand: [
    { id: 'carrot_scepter', name: 'Carrot Scepter', rarity: 'Mythic', img: '/images/stk_carrot.png' },
    { id: 'boombox', name: 'Y2K Boombox', rarity: 'Epic', img: '/images/stk_boombox.png' },
    { id: 'orb', name: 'Cosmic Orb', rarity: 'Rare', img: '/images/stk_galaxy.png' }
  ],
  background: [
    { id: 'galaxy', name: 'Galaxy Nebula', rarity: 'Legendary', color: 'from-purple-600 to-pink-500' },
    { id: 'sunset', name: 'Pastel Sunset', rarity: 'Rare', color: 'from-blue-400 to-pink-400' },
    { id: 'void', name: 'Deep Midnight', rarity: 'Common', color: 'from-slate-900 to-purple-950' }
  ]
};

export default function PongPongLanding() {
  const [activeCategory, setActiveCategory] = useState('head');
  const [selectedTraits, setSelectedTraits] = useState({
    head: 'crown',
    eyes: 'hypno',
    outfit: 'suit',
    hand: 'carrot_scepter',
    background: 'galaxy'
  });
  const [copiedContract, setCopiedContract] = useState(false);
  const [redactedStates, setRedactedStates] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false
  });
  const [emailInput, setEmailInput] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  /* Contract Copy Handler */
  const handleCopyContract = () => {
    navigator.clipboard.writeText('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  /* Toggle Redacted Text */
  const toggleRedacted = (id: number) => {
    setRedactedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* Whitelist Form Submit */
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setNotifySuccess(true);
      setTimeout(() => setNotifySuccess(false), 4000);
      setEmailInput('');
    }
  };

  /* Randomize Traits */
  const randomizeTraits = () => {
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)].id;
    setSelectedTraits({
      head: getRandom(TRAIT_ITEMS.head),
      eyes: getRandom(TRAIT_ITEMS.eyes),
      outfit: getRandom(TRAIT_ITEMS.outfit),
      hand: getRandom(TRAIT_ITEMS.hand),
      background: getRandom(TRAIT_ITEMS.background)
    });
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-[#0F0529] selection:bg-brand-pink selection:text-white font-outfit">
      
      {/* ── BACKGROUND FIGMA GRADIENT & TEXTURE OVERLAY ── */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/images/page_bg.png'), linear-gradient(177.68deg, #B5C1FC 0%, #C9B3F7 35%, #E88CD9 70%, #FFB7E2 100%)`,
          backgroundBlendMode: 'overlay, normal'
        }}
      />

      {/* ── NAVIGATION HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-10 md:py-5 transition-all">
        <nav className="max-w-7xl mx-auto glass-card-light rounded-full px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/90">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0F0529] flex items-center justify-center text-brand-pink font-bungee text-lg shadow-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-bungee text-2xl tracking-tight text-[#0F0529] drop-shadow-sm group-hover:text-purple-800 transition-colors">
              PONGPONG
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-dm-mono text-xs tracking-widest font-bold text-[#0F0529]">
            <a href="#about" className="hover:text-purple-900 hover:scale-105 transition-all uppercase">ABOUT</a>
            <a href="#collection" className="hover:text-purple-900 hover:scale-105 transition-all uppercase">COLLECTION</a>
            <a href="#bunny-lab" className="hover:text-purple-900 hover:scale-105 transition-all uppercase">BUNNY LAB</a>
            <a href="#signal" className="hover:text-purple-900 hover:scale-105 transition-all uppercase">SIGNAL</a>
            <a href="#classified" className="hover:text-purple-900 hover:scale-105 transition-all uppercase">DOCS</a>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <Link 
              href="/game" 
              className="bg-[#0F0529] text-white hover:bg-black font-dm-mono text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all group"
            >
              <span>PLAY GAME</span>
              <ArrowUpRight className="w-4 h-4 text-brand-pink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <section id="about" className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-4 md:px-8 overflow-hidden">
        
        {/* Floating Planet Ornament (Figma ID 16:57443) */}
        <div className="absolute top-[18%] left-[4%] md:left-[8%] w-32 md:w-48 animate-float opacity-95 z-10 pointer-events-none">
          <Image 
            src="/images/planet.png" 
            alt="Floating Planet" 
            width={200} 
            height={170} 
            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>

        {/* Floating Bun Orbit Ornament (Figma ID 16:57417) */}
        <div className="absolute top-[20%] right-[3%] md:right-[6%] w-48 md:w-80 animate-float-delayed opacity-95 z-10 pointer-events-none">
          <Image 
            src="/images/bun_orbit.png" 
            alt="Bunny Orbit Ring" 
            width={340} 
            height={230} 
            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>

        {/* Hero Central Header */}
        <div className="z-20 text-center max-w-4xl mx-auto flex flex-col items-center mt-6">
          
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 glass-pill-light px-6 py-2 rounded-full mb-6 shadow-sm border border-white/90 animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span className="font-dm-mono text-xs md:text-sm font-bold tracking-widest text-[#0F0529] uppercase">
              OFF THE CHAIN, ONTO YOUR DESK
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-bungee text-6xl sm:text-8xl md:text-[11.5rem] leading-[0.85] tracking-tight text-white drop-shadow-[0_12px_28px_rgba(15,5,41,0.4)] select-none">
            PONG<br/>PONG
          </h1>

          {/* Subtitle with High Legibility */}
          <p className="font-outfit text-2xl sm:text-3xl md:text-4xl font-extrabold mt-6 text-[#0F0529] tracking-tight drop-shadow-sm">
            A CULT FOR DEGENS &amp; COLLECTORS
          </p>

          <p className="font-dm-mono text-sm md:text-base text-[#21094E] mt-3 max-w-lg font-bold">
            "They bounced across the multiverse to land on one."
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a 
              href="#bunny-lab" 
              className="bg-[#0F0529] text-white hover:bg-black font-dm-mono text-sm font-bold px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <span>ENTER THE LAB</span>
              <ChevronRight className="w-4 h-4 text-brand-pink" />
            </a>
            <a 
              href="#collection" 
              className="glass-card-white text-[#0F0529] hover:bg-white font-dm-mono text-sm font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all border border-white"
            >
              EXPLORE COLLECTION
            </a>
          </div>
        </div>

        {/* Main 3D Hero Bunny Render (Figma ID 16:56771) */}
        <div className="w-full max-w-xl md:max-w-2xl mt-12 z-20 relative flex justify-center">
          <div className="absolute inset-0 bg-white/50 blur-[100px] rounded-full -z-10 animate-pulse-glow"></div>
          <div className="relative animate-float">
            <Image 
              src="/images/hero_bunny.png" 
              alt="PongPong 3D Voxel Bunny" 
              width={520} 
              height={550} 
              className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500 cursor-pointer"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER 1 (BLACK BAR) ── */}
      <div className="w-full bg-[#0F0826] py-5 overflow-hidden border-y border-purple-400/30 shadow-2xl relative z-30">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4">
              <span className="font-bungee text-brand-pink text-xl md:text-2xl tracking-wider">
                BOUNCING BUNNIES ONCHAIN
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-brand-blue text-xl md:text-2xl tracking-wider">
                350+ TRAITS
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-brand-purple text-xl md:text-2xl tracking-wider">
                LEDGER COVER
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-white text-xl md:text-2xl tracking-wider">
                PLUSHY KEYCHAIN
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-brand-pink text-xl md:text-2xl tracking-wider">
                ROBINHOOD CHAIN
              </span>
              <span className="text-white/40 font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED BUNNY HOP SHOWCASE (02 BUNNY HOP) ── */}
      <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="glass-card-light rounded-[3rem] p-8 md:p-14 border border-white/95 shadow-2xl grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
          
          {/* Decorative Stickers */}
          <div className="absolute top-6 right-6 w-24 md:w-32 animate-float pointer-events-none">
            <Image src="/images/stk_boombox.png" alt="Boombox Sticker" width={140} height={120} />
          </div>

          <div className="space-y-6">
            <div className="inline-block glass-pill-light px-4 py-1.5 rounded-full font-dm-mono text-xs font-extrabold tracking-widest text-[#0F0529] uppercase">
              FEATURED CHARACTER · #001
            </div>

            <h2 className="font-bungee text-4xl sm:text-6xl text-[#0F0529] leading-none tracking-tight">
              BUNNY HOP <br/>
              <span className="text-purple-800">ONCHAIN</span>
            </h2>

            <p className="font-outfit text-lg md:text-xl font-semibold text-[#1A0A38] max-w-md">
              Equipped with a custom carrot jetpack, holographic visor, and tactile voxel plush fabric. Built to bounce across smart contracts.
            </p>

            {/* Trait Chips */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm">
                <div className="font-dm-mono text-[10px] font-bold text-slate-600 tracking-wider uppercase">RARITY</div>
                <div className="font-bungee text-xl text-purple-900 mt-1">MYTHIC (0.1%)</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm">
                <div className="font-dm-mono text-[10px] font-bold text-slate-600 tracking-wider uppercase">ACCESSORY</div>
                <div className="font-bungee text-xl text-pink-700 mt-1">CARROT ROCKET</div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Link 
                href="/game" 
                className="bg-[#0F0529] text-white hover:bg-black font-dm-mono text-sm font-bold px-7 py-3.5 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                <span>TEST IN GAME</span>
                <ArrowUpRight className="w-4 h-4 text-brand-pink" />
              </Link>
            </div>
          </div>

          {/* Bunny Hop 3D Character Hero Render (Figma ID 16:57412) */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-brand-pink/30 blur-3xl rounded-full -z-10"></div>
            <Image 
              src="/images/bunny_hop_hero.png" 
              alt="Bunny Hop Character" 
              width={460} 
              height={500} 
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ── COLLECTION SHOWCASE (01 BOUNCING BUNNIES ONCHAIN) ── */}
      <section id="collection" className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block glass-pill-light px-5 py-2 rounded-full font-dm-mono text-xs font-extrabold tracking-widest text-[#0F0529] uppercase mb-4">
            THE 10K COLLECTION
          </div>
          <h2 className="font-bungee text-4xl sm:text-6xl text-[#0F0529] leading-tight">
            BOUNCING BUNNIES <br/> ONCHAIN
          </h2>
          <p className="font-outfit text-lg font-bold text-[#21094E] mt-4">
            Explore unique generative traits crafted in 3D voxel precision. Every digital asset unlocks physical merchandise.
          </p>
        </div>

        {/* 4 NFT Collection Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Spirit Edition */}
          <div className="glass-card-white rounded-[2.5rem] p-5 border border-white hover:scale-105 transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-purple-950/20 flex items-center justify-center p-4">
              <Image 
                src="/images/bunny_spirit.png" 
                alt="Spirit Bunny" 
                width={260} 
                height={260} 
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#0F0529] text-white font-dm-mono text-[10px] px-3 py-1 rounded-full font-bold">
                #001 SPIRIT
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bungee text-xl text-[#0F0529]">SPIRIT BUNNY</h3>
              <p className="font-dm-mono text-xs text-purple-900 font-bold mt-1">TRAIT: ETHEREAL AURA</p>
            </div>
          </div>

          {/* Card 2: Holographic Edition */}
          <div className="glass-card-white rounded-[2.5rem] p-5 border border-white hover:scale-105 transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-950/20 flex items-center justify-center p-4">
              <Image 
                src="/images/bunny_holographic.png" 
                alt="Holographic Bunny" 
                width={260} 
                height={260} 
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#0F0529] text-white font-dm-mono text-[10px] px-3 py-1 rounded-full font-bold">
                #002 HOLO
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bungee text-xl text-[#0F0529]">HOLO SHEEN</h3>
              <p className="font-dm-mono text-xs text-pink-900 font-bold mt-1">TRAIT: GLASSMORPHISM</p>
            </div>
          </div>

          {/* Card 3: Plush Keychain */}
          <div className="glass-card-white rounded-[2.5rem] p-5 border border-white hover:scale-105 transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-blue-950/20 flex items-center justify-center p-4">
              <Image 
                src="/images/bunny_plush.png" 
                alt="Plush Keychain Bunny" 
                width={260} 
                height={260} 
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#0F0529] text-white font-dm-mono text-[10px] px-3 py-1 rounded-full font-bold">
                #003 PLUSHY
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bungee text-xl text-[#0F0529]">PLUSH KEYCHAIN</h3>
              <p className="font-dm-mono text-xs text-blue-900 font-bold mt-1">TRAIT: COTTON STITCHING</p>
            </div>
          </div>

          {/* Card 4: Golden Relic */}
          <div className="glass-card-white rounded-[2.5rem] p-5 border border-white hover:scale-105 transition-all duration-300 shadow-xl group cursor-pointer flex flex-col justify-between">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-950/20 flex items-center justify-center p-4">
              <Image 
                src="/images/bunny_gold.png" 
                alt="Golden Armor Bunny" 
                width={260} 
                height={260} 
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#0F0529] text-white font-dm-mono text-[10px] px-3 py-1 rounded-full font-bold">
                #004 GOLDEN
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bungee text-xl text-[#0F0529]">GOLDEN ARMOR</h3>
              <p className="font-dm-mono text-xs text-amber-900 font-bold mt-1">TRAIT: 1-OF-1 RELIC</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE BOUNCE GOES PHYSICAL (FEATURES GRID) ── */}
      <section className="py-20 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-14">
          <h2 className="font-bungee text-4xl sm:text-5xl text-[#0F0529]">
            THE BOUNCE GOES PHYSICAL
          </h2>
          <p className="font-outfit text-lg font-bold text-[#21094E] mt-3">
            From the blockchain directly to your desk. Real physical collectibles backed 1:1 by your NFT.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="glass-card-light p-6 rounded-[2rem] border border-white shadow-lg text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 flex items-center justify-center mx-auto mb-4 text-purple-950 font-bungee text-2xl">
              350+
            </div>
            <h3 className="font-bungee text-xl text-[#0F0529] mb-2">350+ TRAITS</h3>
            <p className="font-outfit text-sm font-semibold text-slate-800">Hand-crafted 3D equipment across 8 slots.</p>
          </div>

          <div className="glass-card-light p-6 rounded-[2rem] border border-white shadow-lg text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-pink-600/30 flex items-center justify-center mx-auto mb-4 text-pink-950 font-bungee text-2xl">
              10K
            </div>
            <h3 className="font-bungee text-xl text-[#0F0529] mb-2">10K COLLECTION</h3>
            <p className="font-outfit text-sm font-semibold text-slate-800">Generative algorithm stored 100% onchain.</p>
          </div>

          <div className="glass-card-light p-6 rounded-[2rem] border border-white shadow-lg text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 flex items-center justify-center mx-auto mb-4 text-blue-950 font-bungee text-2xl">
              PLUSH
            </div>
            <h3 className="font-bungee text-xl text-[#0F0529] mb-2">PLUSH KEYCHAIN</h3>
            <p className="font-outfit text-sm font-semibold text-slate-800">Claimable physical companion for holders.</p>
          </div>

          <div className="glass-card-light p-6 rounded-[2rem] border border-white shadow-lg text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/30 flex items-center justify-center mx-auto mb-4 text-amber-950 font-bungee text-2xl">
              COVER
            </div>
            <h3 className="font-bungee text-xl text-[#0F0529] mb-2">LEDGER COVER</h3>
            <p className="font-outfit text-sm font-semibold text-slate-800">Custom engraved metallic shell for hardware wallet.</p>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE BUNNY LAB CUSTOMIZER (03 BUILD YOUR BOUNCE) ── */}
      <section id="bunny-lab" className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="glass-card-light rounded-[3rem] p-8 md:p-14 border border-white shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block glass-pill-light px-5 py-1.5 rounded-full font-dm-mono text-xs font-extrabold tracking-widest text-[#0F0529] uppercase mb-3">
              INTERACTIVE BUILDER
            </div>
            <h2 className="font-bungee text-4xl md:text-5xl text-[#0F0529]">
              BUNNY LAB
            </h2>
            <p className="font-dm-mono text-xs md:text-sm text-purple-950 font-bold tracking-wider mt-2 uppercase">
              Build your bounce before it's real
            </p>
          </div>

          {/* Builder UI Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Slot Category Tabs */}
            <div className="lg:col-span-3 space-y-3 flex flex-col justify-center">
              <div className="font-dm-mono text-xs font-bold text-slate-800 tracking-wider mb-2 px-2 uppercase">
                1. SELECT SLOT
              </div>
              {TRAIT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl font-dm-mono text-xs font-bold transition-all flex items-center justify-between shadow-sm ${
                    activeCategory === cat.id
                      ? 'bg-[#0F0529] text-white shadow-lg scale-102'
                      : 'bg-white/80 text-[#0F0529] hover:bg-white border border-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className={`w-4 h-4 ${activeCategory === cat.id ? 'text-brand-pink' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Middle: Equipment Inventory Grid */}
            <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-dm-mono text-xs font-bold text-slate-800 tracking-wider uppercase">
                    2. CHOOSE ITEM ({activeCategory.toUpperCase()})
                  </span>
                  <button 
                    onClick={randomizeTraits}
                    className="flex items-center gap-1.5 font-dm-mono text-[11px] font-bold text-purple-900 hover:text-black bg-purple-200/80 px-3.5 py-1 rounded-full transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RANDOMIZE</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(TRAIT_ITEMS as any)[activeCategory]?.map((item: any) => {
                    const isSelected = (selectedTraits as any)[activeCategory] === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedTraits(prev => ({ ...prev, [activeCategory]: item.id }))}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all aspect-square ${
                          isSelected
                            ? 'bg-[#0F0529] text-white border-brand-pink ring-2 ring-brand-pink shadow-xl scale-105'
                            : 'bg-white text-[#0F0529] border-white/90 hover:bg-slate-50 hover:scale-102 shadow-sm'
                        }`}
                      >
                        {item.img ? (
                          <div className="w-12 h-12 relative flex items-center justify-center my-auto">
                            <Image src={item.img} alt={item.name} width={48} height={48} className="object-contain" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.color} my-auto shadow-inner`} />
                        )}
                        <span className="font-dm-mono text-[10px] font-bold truncate w-full mt-1">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trait Specs readout */}
              <div className="bg-white rounded-2xl p-4 border border-white shadow-sm">
                <div className="font-dm-mono text-[10px] font-bold text-slate-500 tracking-wider">ACTIVE SELECTION</div>
                <div className="font-bungee text-base text-[#0F0529] mt-0.5">
                  {(TRAIT_ITEMS as any)[activeCategory]?.find((i: any) => i.id === (selectedTraits as any)[activeCategory])?.name || 'Standard'}
                </div>
              </div>
            </div>

            {/* Right: Live Bunny Preview Render */}
            <div className="lg:col-span-4 bg-[#0F0826] backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30 text-white flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
              <div className="w-full flex justify-between items-center z-10">
                <span className="font-dm-mono text-[11px] font-bold text-brand-pink tracking-widest uppercase">
                  LIVE DRAFT
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full font-dm-mono text-[10px] text-white font-bold">
                  3D PREVIEW
                </span>
              </div>

              {/* 3D Preview Image (hero_bunny) */}
              <div className="my-6 relative w-full aspect-square flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-brand-pink/20 blur-2xl rounded-full"></div>
                <Image 
                  src="/images/hero_bunny.png" 
                  alt="Bunny Draft Preview" 
                  width={280} 
                  height={280} 
                  className="object-contain animate-float"
                />
              </div>

              <Link 
                href="/game" 
                className="w-full bg-brand-pink text-[#0F0529] hover:bg-pink-300 font-dm-mono text-xs font-extrabold py-3.5 rounded-2xl text-center shadow-lg transition-all z-10 flex items-center justify-center gap-2"
              >
                <span>MINT DRAFT IN GAME</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SIGNAL DETECTED / $PONGPONG CRYPTO WIDGET (04 SIGNAL) ── */}
      <section id="signal" className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="glass-dark-panel rounded-[3rem] p-8 md:p-14 border border-purple-400/40 text-white shadow-2xl relative overflow-hidden grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Live Token Info & Ticker */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-400/50 px-4 py-1.5 rounded-full font-dm-mono text-xs font-bold text-brand-pink tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>// INCOMING TRANSMISSION //</span>
            </div>

            <h2 className="font-bungee text-4xl sm:text-6xl text-white leading-none tracking-tight">
              SIGNAL <br/>
              <span className="text-brand-pink text-neon-pink">DETECTED</span>
            </h2>

            <p className="font-outfit text-base md:text-lg text-slate-200 max-w-lg font-medium">
              $PONGPONG token powers the ecosystem. Stake your bunnies, swap tokens instantly on Robinhood Chain, and earn physical merch allocations.
            </p>

            {/* Token Metrics Cards */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                <div className="font-dm-mono text-[10px] text-slate-300 font-bold tracking-wider">TOKEN SYMBOL</div>
                <div className="font-bungee text-xl text-brand-pink mt-1">$PONGPONG</div>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                <div className="font-dm-mono text-[10px] text-slate-300 font-bold tracking-wider">NETWORK</div>
                <div className="font-bungee text-xl text-brand-blue mt-1">ROBINHOOD</div>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                <div className="font-dm-mono text-[10px] text-slate-300 font-bold tracking-wider">24H VOLUME</div>
                <div className="font-bungee text-xl text-emerald-400 mt-1">$1.4M+</div>
              </div>
            </div>

            {/* Contract Address Bar */}
            <div className="pt-2">
              <div className="font-dm-mono text-xs text-slate-300 font-bold mb-2">OFFICIAL CONTRACT ADDRESS:</div>
              <div className="bg-black/70 border border-white/30 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 font-dm-mono text-xs">
                <span className="truncate text-brand-pink font-bold">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                <button 
                  onClick={handleCopyContract} 
                  className="bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 font-bold"
                >
                  {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedContract ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Coin Render (Figma ID 16:56813) */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="absolute inset-0 bg-brand-purple/40 blur-3xl rounded-full -z-10 animate-pulse-glow"></div>
            <Image 
              src="/images/pongpong_coin.png" 
              alt="3D Holographic PongPong Coin" 
              width={420} 
              height={420} 
              className="object-contain drop-shadow-[0_20px_50px_rgba(255,154,214,0.4)] animate-float"
            />
          </div>

        </div>
      </section>

      {/* ── DOWN THE RABBIT HOLE (CLASSIFIED DOSSIER 05 DOWN THE) ── */}
      <section id="classified" className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="glass-card-light rounded-[3rem] p-8 md:p-14 border border-white shadow-2xl relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block glass-pill-light px-5 py-1.5 rounded-full font-dm-mono text-xs font-extrabold tracking-widest text-[#0F0529] uppercase mb-3">
              SECRET LORE
            </div>
            <h2 className="font-bungee text-4xl md:text-5xl text-[#0F0529]">
              DOWN THE RABBIT HOLE
            </h2>
            <p className="font-dm-mono text-xs md:text-sm text-purple-950 font-bold tracking-wider mt-2 uppercase">
              Click redacted bars to reveal classified files
            </p>
          </div>

          {/* Dossier Card Container */}
          <div className="max-w-4xl mx-auto bg-[#FFFDF5] border-2 border-amber-950/40 rounded-3xl p-6 md:p-10 shadow-2xl font-dm-mono text-xs md:text-sm text-amber-950 space-y-6 relative">
            
            {/* Stamp Badge */}
            <div className="absolute top-6 right-6 border-2 border-red-600 text-red-600 px-4 py-1 rounded font-bungee text-xs tracking-widest rotate-6 select-none bg-red-50">
              TOP SECRET // CLASSIFIED
            </div>

            <div className="space-y-1 border-b border-amber-900/30 pb-4">
              <div><strong className="font-bold">FILE ID:</strong> PP-DOSSIER-001</div>
              <div><strong className="font-bold">SUBJECT:</strong> THE ORIGIN OF PONGPONG</div>
              <div><strong className="font-bold">CLEARANCE LEVEL:</strong> OMEGA-5</div>
            </div>

            <div className="space-y-4 leading-relaxed font-medium">
              <p>
                In early 2026, autonomous neural signals detected a wave of 10,000 sentient voxel entities jumping through block headers.{' '}
                <span 
                  onClick={() => toggleRedacted(1)}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-all font-bold ${
                    redactedStates[1] ? 'bg-amber-200 text-amber-950' : 'bg-black text-black hover:bg-slate-800'
                  }`}
                  title="Click to reveal"
                >
                  {redactedStates[1] ? 'They originated from Robinhood Chain block #4928102.' : '████████████████████████████████████████'}
                </span>
              </p>

              <p>
                Each entity carries physical metadata matching high-density cotton keychains and laser-etched hardware wallet covers.{' '}
                <span 
                  onClick={() => toggleRedacted(2)}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-all font-bold ${
                    redactedStates[2] ? 'bg-amber-200 text-amber-950' : 'bg-black text-black hover:bg-slate-800'
                  }`}
                  title="Click to reveal"
                >
                  {redactedStates[2] ? 'Physical shipments trigger automatically upon onchain burn.' : '████████████████████████████████████████████████'}
                </span>
              </p>

              <p>
                WARNING: Redactions are permanent.{' '}
                <span 
                  onClick={() => toggleRedacted(3)}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-all font-bold ${
                    redactedStates[3] ? 'bg-amber-200 text-amber-950' : 'bg-black text-black hover:bg-slate-800'
                  }`}
                  title="Click to reveal"
                >
                  {redactedStates[3] ? 'Holders move first when the sky drops.' : '██████████████████████████████'}
                </span>
              </p>
            </div>

            <div className="pt-4 border-t border-amber-900/30 flex justify-between items-center text-[10px] text-amber-950 font-bold">
              <span>STATUS: ACTIVE DISCOVERY</span>
              <span>PONGPONG RESEARCH DIVISION</span>
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER 2 (SOMETHING'S FALLING) ── */}
      <div className="w-full bg-[#0F0826] py-5 overflow-hidden border-y border-purple-400/30 shadow-2xl relative z-30">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4">
              <span className="font-bungee text-brand-pink text-xl md:text-2xl tracking-wider">
                HOLD YOUR BUNNY
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-brand-blue text-xl md:text-2xl tracking-wider">
                HOLD YOUR BREATH
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-brand-purple text-xl md:text-2xl tracking-wider">
                SOMETHING'S FALLING FROM THE SKY
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="font-bungee text-white text-xl md:text-2xl tracking-wider">
                퐁퐁
              </span>
              <span className="text-white/40 font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOMETHING'S FALLING TEASER (06 SOMETHING'S FALLING) ── */}
      <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto relative z-20">
        <div className="glass-card-light rounded-[3rem] p-8 md:p-14 border border-white shadow-2xl grid md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <div className="inline-block glass-pill-light px-4 py-1.5 rounded-full font-dm-mono text-xs font-extrabold tracking-widest text-[#0F0529] uppercase">
              UPCOMING AIRDROP EVENT
            </div>

            <h2 className="font-bungee text-4xl sm:text-6xl text-[#0F0529] leading-none tracking-tight">
              SOMETHING'S FALLING FROM THE <br/>
              <span className="text-purple-900">ROBINHOOD SKY</span>
            </h2>

            <p className="font-outfit text-base md:text-lg font-bold text-[#1A0A38]">
              When it lands, holders move first. Enter your wallet or email to secure your priority whitelist spot.
            </p>

            {/* Email Whitelist Form */}
            <form onSubmit={handleNotifySubmit} className="flex gap-3 pt-2">
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter wallet address or email"
                required
                className="flex-1 bg-white/90 border border-white rounded-full px-6 py-3.5 font-dm-mono text-xs text-[#0F0529] font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-inner"
              />
              <button 
                type="submit" 
                className="bg-[#0F0529] text-white hover:bg-black font-dm-mono text-xs font-bold px-6 py-3.5 rounded-full shadow-xl hover:scale-105 transition-all shrink-0"
              >
                NOTIFY ME
              </button>
            </form>

            {notifySuccess && (
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-dm-mono text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>You are on the secret transmission whitelist!</span>
              </div>
            )}
          </div>

          {/* Falling Sticker Carrot Render (Figma ID 16:57232) */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-brand-pink/30 blur-3xl rounded-full -z-10"></div>
            <Image 
              src="/images/stk_carrot.png" 
              alt="Falling Carrot Rocket" 
              width={380} 
              height={400} 
              className="object-contain animate-float drop-shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F0826] text-white py-16 px-6 md:px-12 border-t border-purple-400/30 relative z-30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="font-bungee text-3xl text-white tracking-wider">
              PONGPONG
            </div>
            <p className="font-outfit text-xs text-slate-300 leading-relaxed font-medium">
              A cult for degens &amp; collectors. Bouncing bunnies onchain, delivering physical plushies &amp; ledger covers straight to your desk.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3 font-dm-mono text-xs">
            <div className="font-bold text-brand-pink tracking-widest uppercase mb-2">EXPLORE</div>
            <div><a href="#about" className="text-slate-300 hover:text-white transition-colors">About Story</a></div>
            <div><a href="#collection" className="text-slate-300 hover:text-white transition-colors">10K Collection</a></div>
            <div><a href="#bunny-lab" className="text-slate-300 hover:text-white transition-colors">Bunny Lab Customizer</a></div>
            <div><a href="#signal" className="text-slate-300 hover:text-white transition-colors">Signal &amp; Token</a></div>
          </div>

          {/* Col 3: Community */}
          <div className="space-y-3 font-dm-mono text-xs">
            <div className="font-bold text-brand-blue tracking-widest uppercase mb-2">ELSEWHERE</div>
            <div>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <TwitterIcon className="w-3.5 h-3.5" />
                <span>X / Twitter</span>
              </a>
            </div>
            <div>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <DiscordIcon className="w-3.5 h-3.5" />
                <span>Discord Community</span>
              </a>
            </div>
            <div>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <TelegramIcon className="w-3.5 h-3.5" />
                <span>Telegram Signal</span>
              </a>
            </div>
          </div>

          {/* Col 4: Contract Pill */}
          <div className="space-y-4 font-dm-mono text-xs">
            <div className="font-bold text-brand-purple tracking-widest uppercase">SMART CONTRACT</div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <div className="text-[10px] text-slate-300 font-bold mb-1">ROBINHOOD CHAIN</div>
              <div className="text-brand-pink truncate font-bold">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-dm-mono gap-4 font-medium">
          <div>
            © {new Date().getFullYear()} PONGPONG. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-white cursor-pointer">TERMS OF SERVICE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
