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
      
      {/* ── BACKGROUND FIGMA ATMOSPHERIC GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Hero Ambient Cosmic Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-75"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(255, 245, 255, 0.7) 0%, rgba(225, 205, 255, 0.35) 45%, transparent 75%)'
          }}
        />
        {/* Soft dream clouds */}
        <div 
          className="absolute top-[80px] left-[5%] w-[450px] h-[350px] rounded-full filter blur-[80px] opacity-40 pointer-events-none"
          style={{ background: 'rgba(255, 225, 248, 0.7)' }}
        />
        <div 
          className="absolute top-[120px] right-[8%] w-[500px] h-[400px] rounded-full filter blur-[90px] opacity-45 pointer-events-none"
          style={{ background: 'rgba(220, 205, 255, 0.8)' }}
        />
      </div>

      {/* ── FLOATING FIGMA NAVBAR (00 NAV) ── */}
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 transition-all flex justify-center pointer-events-none">
        <nav className="figma-navbar-glass rounded-full px-5 md:px-6 h-[50px] md:h-[54px] flex items-center justify-between w-[92%] max-w-[360px] md:w-[710px] md:max-w-[710px] shadow-2xl pointer-events-auto transition-all">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <span className="font-bungee text-[16px] md:text-[18px] tracking-tight text-[#241444] group-hover:text-purple-900 transition-colors">
              PONGPONG
            </span>
            <span className="font-outfit text-[11px] font-bold text-[#6D5396]">퐁퐁</span>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 font-dm-mono text-[11px] tracking-[0.08em] font-bold text-[#241444]">
            <a href="#about" className="hover:text-purple-800 transition-colors uppercase">THE WARREN</a>
            <a href="#bunny-lab" className="hover:text-purple-800 transition-colors uppercase">THE WARREN LAB</a>
            <a href="#signal" className="hover:text-purple-800 transition-colors uppercase">$PONGPONG</a>
            <a href="#classified" className="hover:text-purple-800 transition-colors uppercase">DROP</a>
          </div>

          {/* Action Button: GIB WL? */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => {
                const el = document.getElementById('classified') || document.getElementById('signals');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="figma-btn-gibwl font-bungee text-[11px] tracking-wider text-[#241444] px-4 md:px-5 py-1.5 md:py-2 rounded-full cursor-pointer"
            >
              GIB WL?
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <section id="about" className="relative min-h-[78vh] md:min-h-[86vh] flex flex-col items-center justify-center pt-28 md:pt-36 pb-8 md:pb-12 px-4 overflow-hidden">
        
        {/* 3D Liquid Chrome PongPong Title Logo + Orbit Ring + Planet (Figma Master Composition) */}
        <div className="z-20 text-center max-w-5xl mx-auto flex flex-col items-center w-full mt-2 md:mt-0">
          
          <div className="relative w-full max-w-4xl flex justify-center items-center animate-float">
            <Image 
              src="/images/hero_art_master.png" 
              alt="PongPong 3D Liquid Chrome Hero Artwork" 
              width={1400} 
              height={517} 
              className="object-contain w-full max-w-[370px] sm:max-w-[620px] md:max-w-[860px] drop-shadow-[0_20px_45px_rgba(30,10,60,0.2)] hover:scale-102 transition-transform duration-500"
              priority
            />
          </div>

          {/* Text Content below Hero Title */}
          <div className="mt-4 md:mt-6 flex flex-col items-center space-y-2.5">
            <span className="font-dm-mono text-[11px] md:text-[13px] font-semibold tracking-[0.16em] text-[#200E3B] uppercase">
              BOUNCING BUNNIES ONCHAIN
            </span>

            <h1 className="font-bungee text-[23px] sm:text-3xl md:text-5xl lg:text-[44px] text-[#200E3B] tracking-tight leading-tight text-center max-w-none md:max-w-4xl">
              EVERY CHAIN WAS JUST A <span className="text-[#FF58B8]">LAYOVER.</span>
            </h1>

            <p className="font-dm-mono text-xs md:text-sm text-[#200E3B] font-medium text-center max-w-md px-2">
              they bounced across the multiverse to land on one.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3.5 md:gap-5 pt-3">
              <a 
                href="#bunny-lab" 
                className="figma-btn-hero font-bungee text-xs md:text-sm text-[#200E3B] px-6 md:px-8 py-2.5 md:py-3.5 rounded-full cursor-pointer"
              >
                ENTER THE LAB
              </a>
              <button 
                onClick={() => {
                  const el = document.getElementById('classified') || document.getElementById('signals');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="figma-btn-hero font-bungee text-xs md:text-sm text-[#200E3B] px-6 md:px-8 py-2.5 md:py-3.5 rounded-full cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FDC4EC 0%, #D8C0FB 50%, #BFE8FD 100%)'
                }}
              >
                GIB WL?
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* ── FIGMA DUAL OVERLAPPING TILTED MARQUEE RIBBONS ── */}
      <div className="w-full relative z-30 py-8 overflow-hidden space-y-3">
        
        {/* Ribbon 1: Tilted Upwards */}
        <div className="w-full ribbon-banner-1 py-4.5 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-4">
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">
                  BOUNCING BUNNIES ONCHAIN
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-purple-900 text-xl md:text-2xl tracking-wider">
                  350+ TRAITS
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">
                  LEDGER COVER, PLUSHY KEYCHAIN
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-pink-900 text-xl md:text-2xl tracking-wider">
                  GIB WL?
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ribbon 2: Tilted Downwards */}
        <div className="w-full ribbon-banner-2 py-4.5 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-4">
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">
                  A CULT FOR DEGENS &amp; COLLECTORS
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-purple-950 text-xl md:text-2xl tracking-wider">
                  NATIVE TO ROBINHOOD CHAIN
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-pink-950 text-xl md:text-2xl tracking-wider">
                  퐁퐁
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">
                  ONE CHAIN NO MORE HOPPING
                </span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SECTION 01: THE COLLECTION (BOUNCING BUNNIES ONCHAIN) ── */}
      <section id="collection" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20 overflow-hidden">
        
        {/* Section Header (Figma 3D Master Artwork with Bubble Bunnies & Title) */}
        <div className="relative max-w-5xl mx-auto mb-10 md:mb-14 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Image 
              src="/images/sec1_header_master.png" 
              alt="The Collection - Bouncing Bunnies Onchain" 
              width={1440} 
              height={480} 
              className="w-full max-w-[960px] object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)]"
              priority
            />
          </div>

          <div className="mt-[-8px] md:mt-[-14px] glass-pill-light px-6 py-2 rounded-full border border-white shadow-md relative z-10">
            <p className="font-outfit text-xs md:text-sm font-bold text-[#200E3B]">
              a cult for degens &amp; collectors · native to Robinhood Chain
            </p>
          </div>
        </div>

        {/* 4 3D NFT Frame Cards in Staggered Perspective */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-20 max-w-6xl mx-auto items-center">
          
          {/* Card 1: Netherland Dwarf */}
          <div className="transform -rotate-2 hover:rotate-0 hover:-translate-y-3 transition-all duration-300 cursor-pointer drop-shadow-[0_15px_30px_rgba(30,14,56,0.2)]">
            <Image 
              src="/images/card-netherland-dwarf.png" 
              alt="#001 Netherland Dwarf" 
              width={380} 
              height={395} 
              className="w-full object-contain"
            />
          </div>

          {/* Card 2: Alien Hybrid */}
          <div className="transform -rotate-1 -translate-y-2 hover:-translate-y-5 hover:rotate-0 transition-all duration-300 cursor-pointer drop-shadow-[0_20px_35px_rgba(30,14,56,0.25)]">
            <Image 
              src="/images/card-alien-hybrid.png" 
              alt="#002 Alien Hybrid" 
              width={380} 
              height={395} 
              className="w-full object-contain"
            />
          </div>

          {/* Card 3: Harlequin Patch */}
          <div className="transform rotate-1 hover:rotate-0 hover:-translate-y-3 transition-all duration-300 cursor-pointer drop-shadow-[0_15px_30px_rgba(30,14,56,0.2)]">
            <Image 
              src="/images/card-harlequin-patch.png" 
              alt="#003 Harlequin Patch" 
              width={380} 
              height={395} 
              className="w-full object-contain"
            />
          </div>

          {/* Card 4: Spirit Bunny */}
          <div className="transform rotate-2 -translate-y-2 hover:-translate-y-5 hover:rotate-0 transition-all duration-300 cursor-pointer drop-shadow-[0_20px_35px_rgba(30,14,56,0.25)]">
            <Image 
              src="/images/card-spirit-bunny.png" 
              alt="#004 Spirit Bunny" 
              width={380} 
              height={395} 
              className="w-full object-contain"
            />
          </div>

        </div>

        {/* Flight Departure Board */}
        <div className="mt-14 md:mt-20 max-w-5xl mx-auto relative z-20">
          <div className="relative group cursor-pointer">
            <Image 
              src="/images/departure_board_clean.png" 
              alt="Flight Departure Board" 
              width={1250} 
              height={470} 
              className="w-full object-contain drop-shadow-[0_25px_50px_rgba(20,10,45,0.35)] group-hover:scale-[1.01] transition-transform duration-300 rounded-[28px]"
            />
          </div>
        </div>

      </section>

      {/* ── SECTION 02: THE BOUNCE GOES PHYSICAL (MERCH 02) ── */}
      <section id="merch" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
        <div className="relative w-full max-w-6xl mx-auto drop-shadow-[0_25px_60px_rgba(25,12,50,0.25)]">
          <Image 
            src="/images/section-physical.png" 
            alt="The Bounce Goes Physical - Phone Covers, Laptop Covers, Ledger Covers, Airpod Covers" 
            width={1320} 
            height={880} 
            className="w-full object-contain rounded-[36px]"
          />
        </div>
      </section>

      {/* ── SECTION 03: INTERACTIVE BUNNY LAB (03 BUILD YOUR BOUNCE) ── */}
      <section id="bunny-lab" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
        {/* Master 3D Header: BUILD YOUR BOUNCE BEFORE IT'S REAL */}
        <div className="relative max-w-5xl mx-auto mb-10 md:mb-14 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Image 
              src="/images/sec3_title_master.png" 
              alt="Bunny Lab - Build Your Bounce Before It's Real" 
              width={1440} 
              height={560} 
              className="w-full max-w-[980px] object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)]"
            />
          </div>

          <div className="mt-[-10px] md:mt-[-18px] glass-pill-light px-6 py-2 rounded-full border border-white shadow-md relative z-10">
            <p className="font-outfit text-xs md:text-sm font-bold text-[#200E3B]">
              350+ traits, zero permission needed. Mix, match, meme.
            </p>
          </div>
        </div>

        {/* Master Interactive 3-Panel Container */}
        <div className="relative w-full max-w-6xl mx-auto drop-shadow-[0_25px_60px_rgba(25,12,50,0.25)]">
          <Image 
            src="/images/sec3_panels_master.png" 
            alt="Bunny Lab Customizer 3-Panels (Choose slot, Pick trait, Live draft)" 
            width={1440} 
            height={730} 
            className="w-full object-contain rounded-[36px]"
          />
        </div>
      </section>

      {/* ── SECTION 04: $PONGPONG / SIGNAL DETECTED (04 SIGNAL) ── */}
      <section id="signal" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
        <div className="relative w-full max-w-6xl mx-auto drop-shadow-[0_30px_70px_rgba(20,10,45,0.35)]">
          <Image 
            src="/images/sec4_master_container.png" 
            alt="Signal Detected $PongPong - Swap Eth on Robinhood Chain" 
            width={1440} 
            height={950} 
            className="w-full object-contain rounded-[40px]"
          />
        </div>
      </section>

      {/* ── SECTION 05: DOWN THE RABBIT HOLE (05 CLASSIFIED) ── */}
      <section id="classified" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
        <div className="relative w-full max-w-6xl mx-auto drop-shadow-[0_30px_70px_rgba(25,12,50,0.25)]">
          <Image 
            src="/images/sec5_master_container.png" 
            alt="Down The Rabbit Hole - Classified Dossier" 
            width={1440} 
            height={820} 
            className="w-full object-contain rounded-[40px]"
          />
        </div>
      </section>

      {/* ── TILTED MARQUEE 3 (HOLD YOUR BUNNY) ── */}
      <div className="w-full overflow-hidden py-8 relative z-20">
        <div className="w-full max-w-[1440px] mx-auto">
          <Image 
            src="/images/marquee_hold_bunny.png" 
            alt="Hold Your Bunny • Hold Your Breath Marquee Banner" 
            width={1440} 
            height={150} 
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* ── SECTION 06: SOMETHING'S FALLING FROM THE ROBINHOOD SKY (06 TEASER) ── */}
      <section id="drop" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto relative z-20 text-center">
        <div className="relative max-w-5xl mx-auto mb-10 md:mb-14 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Image 
              src="/images/sec6_title_master.png" 
              alt="Something's Falling From The Robinhood Sky" 
              width={1440} 
              height={620} 
              className="w-full max-w-[980px] object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)]"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <Link 
              href="#bunny-lab" 
              className="figma-btn-hero text-[#0F0529] font-bungee text-sm md:text-base px-9 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>ENTER THE LAB</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MASTER FOOTER ── */}
      <footer className="pb-16 px-4 md:px-8 max-w-7xl mx-auto relative z-30">
        <div className="relative w-full max-w-6xl mx-auto drop-shadow-[0_25px_60px_rgba(15,8,38,0.4)]">
          <Image 
            src="/images/footer_master_container.png" 
            alt="PongPong Footer - Explore, Elsewhere, Status" 
            width={1440} 
            height={460} 
            className="w-full object-contain rounded-[40px]"
          />
        </div>
      </footer>

    </div>
  );
}
