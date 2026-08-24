'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingModal } from '@/components/OnboardingModal';
import {
  Gamepad2, Carrot, Gift, Zap, Diamond, CircleDot,
  Heart, Repeat2, Users, Shield, Smartphone,
  Globe, ChevronDown, Play,
} from 'lucide-react';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

/* ──────────────────────────────────────────────
   CSS Pixel Art Bunny — built with inline SVG
   No images needed, purely declarative
────────────────────────────────────────────── */
const BunnyPixelArt = ({ animate = true }: { animate?: boolean }) => (
  <svg
    viewBox="0 0 80 96"
    style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    className={`w-32 h-40 sm:w-40 sm:h-52 drop-shadow-2xl ${animate ? 'bunny-hop' : ''}`}
    aria-label="Pixel art bunny character"
  >
    {/* Left ear outer */}
    <rect x="14" y="0" width="10" height="28" fill="#f0f0f0" />
    {/* Left ear inner */}
    <rect x="16" y="2" width="6" height="22" fill="#ffb3c6" />
    {/* Right ear outer */}
    <rect x="56" y="0" width="10" height="28" fill="#f0f0f0" />
    {/* Right ear inner */}
    <rect x="58" y="2" width="6" height="22" fill="#ffb3c6" />
    {/* Ear outlines */}
    <rect x="14" y="0" width="10" height="2" fill="#2a2a2a" />
    <rect x="24" y="0" width="2" height="28" fill="#2a2a2a" />
    <rect x="12" y="0" width="2" height="28" fill="#2a2a2a" />
    <rect x="56" y="0" width="10" height="2" fill="#2a2a2a" />
    <rect x="66" y="0" width="2" height="28" fill="#2a2a2a" />
    <rect x="54" y="0" width="2" height="28" fill="#2a2a2a" />
    {/* Head */}
    <rect x="8" y="24" width="64" height="36" fill="#f5f5f0" />
    {/* Head outline */}
    <rect x="6" y="24" width="2" height="36" fill="#2a2a2a" />
    <rect x="72" y="24" width="2" height="36" fill="#2a2a2a" />
    <rect x="8" y="22" width="64" height="2" fill="#2a2a2a" />
    <rect x="8" y="60" width="64" height="2" fill="#2a2a2a" />
    {/* Eye left */}
    <rect x="18" y="34" width="10" height="10" fill="#1a1a2e" />
    <rect x="20" y="34" width="4" height="4" fill="white" />
    {/* Eye right */}
    <rect x="52" y="34" width="10" height="10" fill="#1a1a2e" />
    <rect x="54" y="34" width="4" height="4" fill="white" />
    {/* Blush left */}
    <rect x="12" y="44" width="10" height="6" fill="#ffc2c9" />
    {/* Blush right */}
    <rect x="58" y="44" width="10" height="6" fill="#ffc2c9" />
    {/* Nose */}
    <rect x="36" y="48" width="8" height="6" fill="#ffb3c6" />
    <rect x="36" y="48" width="8" height="2" fill="#ff80a0" />
    {/* Mouth */}
    <rect x="34" y="54" width="4" height="2" fill="#2a2a2a" />
    <rect x="42" y="54" width="4" height="2" fill="#2a2a2a" />
    <rect x="32" y="52" width="4" height="2" fill="#2a2a2a" />
    <rect x="44" y="52" width="4" height="2" fill="#2a2a2a" />
    {/* Body */}
    <rect x="12" y="62" width="56" height="28" fill="#f5f5f0" />
    {/* Body outline */}
    <rect x="10" y="62" width="2" height="28" fill="#2a2a2a" />
    <rect x="68" y="62" width="2" height="28" fill="#2a2a2a" />
    <rect x="12" y="90" width="56" height="2" fill="#2a2a2a" />
    {/* Belly */}
    <rect x="24" y="66" width="32" height="18" fill="#fffdf8" />
    {/* Left arm */}
    <rect x="4" y="64" width="10" height="16" fill="#f5f5f0" />
    <rect x="2" y="64" width="2" height="16" fill="#2a2a2a" />
    <rect x="4" y="80" width="10" height="2" fill="#2a2a2a" />
    {/* Right arm */}
    <rect x="66" y="64" width="10" height="16" fill="#f5f5f0" />
    <rect x="76" y="64" width="2" height="16" fill="#2a2a2a" />
    <rect x="66" y="80" width="10" height="2" fill="#2a2a2a" />
    {/* Left foot */}
    <rect x="14" y="90" width="22" height="8" fill="#e8e8e0" />
    <rect x="12" y="90" width="2" height="8" fill="#2a2a2a" />
    <rect x="36" y="90" width="2" height="8" fill="#2a2a2a" />
    <rect x="14" y="98" width="24" height="2" fill="#2a2a2a" />
    {/* Right foot */}
    <rect x="44" y="90" width="22" height="8" fill="#e8e8e0" />
    <rect x="42" y="90" width="2" height="8" fill="#2a2a2a" />
    <rect x="66" y="90" width="2" height="8" fill="#2a2a2a" />
    <rect x="44" y="98" width="24" height="2" fill="#2a2a2a" />
    {/* Tail */}
    <rect x="68" y="68" width="12" height="12" fill="white" rx={2} />
    <rect x="68" y="68" width="12" height="2" fill="#2a2a2a" />
    <rect x="68" y="78" width="12" height="2" fill="#2a2a2a" />
    <rect x="68" y="68" width="2" height="12" fill="#2a2a2a" />
    <rect x="78" y="68" width="2" height="12" fill="#2a2a2a" />
    {/* Carrot in hand */}
    <rect x="68" y="72" width="14" height="4" fill="#ff7f2a" />
    <rect x="82" y="70" width="4" height="2" fill="#4caf50" />
    <rect x="84" y="68" width="2" height="4" fill="#4caf50" />
  </svg>
);

/* ──────────────────────────────────────────────
   Floating pixel carrots decoration
────────────────────────────────────────────── */
const FloatingCarrot = ({ style }: { style: React.CSSProperties }) => (
  <svg viewBox="0 0 16 24" className="absolute" style={{ imageRendering: 'pixelated', ...style }} aria-hidden>
    <rect x="6" y="0" width="2" height="4" fill="#4caf50" />
    <rect x="4" y="2" width="2" height="4" fill="#4caf50" />
    <rect x="8" y="2" width="2" height="4" fill="#4caf50" />
    <rect x="4" y="6" width="8" height="2" fill="#ff7f2a" />
    <rect x="2" y="8" width="12" height="6" fill="#ff7f2a" />
    <rect x="4" y="14" width="8" height="4" fill="#ff7f2a" />
    <rect x="6" y="18" width="4" height="4" fill="#ff7f2a" />
    <rect x="6" y="22" width="2" height="2" fill="#ff7f2a" />
  </svg>
);

const CARROT_POSITIONS = [
  { top: '12%', left: '5%', width: 20, opacity: 0.7, animDelay: '0s', animDur: '3.2s' },
  { top: '30%', right: '8%', width: 16, opacity: 0.5, animDelay: '1.1s', animDur: '4s' },
  { top: '60%', left: '3%', width: 14, opacity: 0.6, animDelay: '0.7s', animDur: '3.5s' },
  { top: '75%', right: '5%', width: 18, opacity: 0.4, animDelay: '2s', animDur: '3.8s' },
  { top: '20%', right: '18%', width: 12, opacity: 0.3, animDelay: '1.5s', animDur: '4.2s' },
];

/* ──────────────────────────────────────────────
   Icon wrapper for step / feature cards
────────────────────────────────────────────── */
const IconCircle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${className}`}>
    {children}
  </div>
);

/* ──────────────────────────────────────────────
   SVG Carrot icon for nav logo
────────────────────────────────────────────── */
const BunnyLogo = () => (
  <svg viewBox="0 0 24 28" className="w-6 h-7" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }} aria-hidden>
    {/* Left ear */}
    <rect x="3" y="0" width="4" height="10" fill="#f0f0f0" />
    <rect x="4" y="1" width="2" height="7" fill="#ffb3c6" />
    {/* Right ear */}
    <rect x="17" y="0" width="4" height="10" fill="#f0f0f0" />
    <rect x="18" y="1" width="2" height="7" fill="#ffb3c6" />
    {/* Head */}
    <rect x="2" y="8" width="20" height="12" fill="#f5f5f0" />
    {/* Eyes */}
    <rect x="6" y="12" width="3" height="3" fill="#1a1a2e" />
    <rect x="15" y="12" width="3" height="3" fill="#1a1a2e" />
    {/* Nose */}
    <rect x="11" y="16" width="2" height="2" fill="#ffb3c6" />
    {/* Body */}
    <rect x="4" y="20" width="16" height="8" fill="#f5f5f0" />
  </svg>
);

/* ──────────────────────────────────────────────
   Main Landing Page
────────────────────────────────────────────── */
export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes bunnyHop {
          0%, 100% { transform: translateY(0) scaleX(1); }
          40% { transform: translateY(-18px) scaleX(0.95); }
          55% { transform: translateY(-22px) scaleX(0.9); }
          70% { transform: translateY(-6px) scaleX(1.05); }
        }
        .bunny-hop { animation: bunnyHop 1.8s cubic-bezier(0.36, 0, 0.66, -0.56) infinite; }

        @keyframes carrotFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-14px) rotate(5deg); }
        }
        .carrot-float { animation: carrotFloat linear infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .text-shimmer {
          background: linear-gradient(90deg, #f97316, #fbbf24, #f97316, #fb923c, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeSlideUp 0.6s ease-out both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }

        @keyframes pixelPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(251,191,36,0); }
        }
        .pixel-pulse { animation: pixelPulse 2s ease-in-out infinite; }

        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden !important; overflow-y: auto !important; position: static !important; }
      `}</style>

      <div
        className="min-h-screen w-full overflow-x-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0a2e 30%, #0a1628 60%, #0d1a12 100%)' }}
      >
        {/* ── NAV ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-3 transition-all duration-300"
          style={{ background: scrollY > 40 ? 'rgba(10,10,25,0.85)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(16px)' : 'none', borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
        >
          <div className="flex items-center gap-2.5">
            <BunnyLogo />
            <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              BUNNY HOP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#how" className="text-white/60 hover:text-white text-xs font-semibold transition-colors hidden sm:block">How it works</a>
            <a href="#rewards" className="text-white/60 hover:text-white text-xs font-semibold transition-colors hidden sm:block">Rewards</a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary py-2 px-4 text-xs sm:text-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play Now</span>
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-20 pb-10 overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

          {/* Floating carrots */}
          {CARROT_POSITIONS.map((c, i) => (
            <FloatingCarrot
              key={i}
              style={{
                top: c.top, left: c.left, right: c.right,
                width: c.width, height: c.width * 1.5,
                opacity: c.opacity,
                animation: `carrotFloat ${c.animDur} ease-in-out ${c.animDelay} infinite`
              }}
            />
          ))}

          {/* Bunny */}
          <div className="relative mb-6 fade-up fade-up-1">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
            <BunnyPixelArt animate />
          </div>

          {/* Title */}
          <h1 className="font-black text-5xl sm:text-7xl md:text-8xl text-white leading-none tracking-tight mb-3 fade-up fade-up-2"
            style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)', textShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}>
            BUNNY&nbsp;
            <span className="text-shimmer">HOP</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-lg mb-2 fade-up fade-up-2 font-medium leading-relaxed">
            The <span className="text-amber-400 font-black">pixel-perfect</span> arcade game where every hop earns real Web3 rewards.
          </p>
          <p className="text-white/40 text-xs sm:text-sm mb-8 fade-up fade-up-2">
            Dodge traffic &bull; Collect carrots &bull; Claim rewards
          </p>

          {/* CTA */}
          <div className="fade-up fade-up-3 flex flex-col sm:flex-row gap-3 items-center mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary pixel-pulse text-base sm:text-lg"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Play Now &amp; Earn Carrots</span>
            </button>
            <a href="#how" className="btn-secondary text-sm flex items-center gap-1.5">
              <span>Learn More</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Social proof pills */}
          <div className="mt-10 flex flex-wrap gap-2 justify-center fade-up fade-up-4">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, text: 'Web3 Secured' },
              { icon: <Zap className="w-3.5 h-3.5" />, text: 'Instant Rewards' },
              { icon: <Smartphone className="w-3.5 h-3.5" />, text: 'Mobile Ready' },
              { icon: <Globe className="w-3.5 h-3.5" />, text: 'Play Anywhere' },
            ].map((p) => (
              <span key={p.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold">
                {p.icon} {p.text}
              </span>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 animate-bounce">
            <span className="text-white text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
            <div className="w-px h-6 bg-white/40" />
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              Three Hops to Earning
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Gamepad2 className="w-6 h-6 text-brand-orange" />,
                iconBg: 'bg-brand-orange/10',
                title: 'Hop Across',
                desc: 'Guide your pixel bunny across busy roads and rivers. Each hop forward scores points. Avoid cars — they hurt!'
              },
              {
                step: '02',
                icon: <Carrot className="w-6 h-6 text-orange-400" />,
                iconBg: 'bg-orange-400/10',
                title: 'Collect Carrots',
                desc: 'Gather carrots scattered across the map. Hit 5+ in one run to qualify for FCFS rewards. Hit all 9 for guaranteed rare rewards.'
              },
              {
                step: '03',
                icon: <Gift className="w-6 h-6 text-brand-purple" />,
                iconBg: 'bg-brand-purple/10',
                title: 'Claim Rewards',
                desc: 'Connect your wallet, complete tasks, and claim your Web3 rewards. Refer friends for bonus carrots and exclusive perks.'
              },
            ].map((s) => (
              <div key={s.step} className="card-surface relative group">
                <div className="absolute -top-3 left-5 px-2 py-0.5 rounded-md bg-brand-orange text-white text-[10px] font-black tracking-widest">{s.step}</div>
                <IconCircle className={s.iconBg}>{s.icon}</IconCircle>
                <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REWARDS ── */}
        <section id="rewards" className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest mb-4">Reward Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              How Many Carrots You Need
            </h2>
            <p className="text-white/40 text-sm mt-2">Every run can earn you a reward — if you hop fast enough.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tier 1 */}
            <div className="card-surface text-left opacity-75">
              <IconCircle className="bg-white/5">
                <CircleDot className="w-6 h-6 text-white/40" />
              </IconCircle>
              <div className="font-black text-sm mb-1">1–4 Carrots: No Reward</div>
              <div className="text-[11px] opacity-75 leading-relaxed">You&apos;re warming up! Keep hopping and grab more carrots next run.</div>
            </div>
            {/* Tier 2 */}
            <div className="card-surface text-left border-brand-orange/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <IconCircle className="bg-brand-orange/10">
                <Zap className="w-6 h-6 text-brand-orange" />
              </IconCircle>
              <div className="font-black text-sm mb-1">5–8 Carrots: FCFS Tier</div>
              <div className="text-[11px] opacity-75 leading-relaxed">First-Come-First-Served! Submit your score early to claim from the reward pool.</div>
            </div>
            {/* Tier 3 */}
            <div className="card-surface text-left border-brand-purple/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-brand-purple/5 hover:bg-brand-purple/10">
              <IconCircle className="bg-brand-purple/10">
                <Diamond className="w-6 h-6 text-brand-purple" />
              </IconCircle>
              <div className="font-black text-sm mb-1">9 Carrots: GUARANTEED</div>
              <div className="text-[11px] opacity-75 leading-relaxed">The 9th carrot has 1-in-100 spawn odds. Hit it and a guaranteed reward is yours — no racing needed.</div>
            </div>
          </div>
        </section>

        {/* ── TASKS & EARN MORE ── */}
        <section className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
          <div className="card-surface p-8 sm:p-10 border-brand-purple/20 bg-gradient-to-br from-brand-orange/5 to-brand-purple/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
              <div>
                <IconCircle className="bg-brand-purple/10">
                  <Gift className="w-6 h-6 text-brand-purple" />
                </IconCircle>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
                  Earn More With Tasks
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-md">
                  Beyond the game, complete social tasks to stack bonus carrots. Link your X/Twitter, like our launch post, retweet, and refer friends — each task unlocks extra rewards.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-[200px]">
                {[
                  { icon: <TwitterIcon className="w-5 h-5 text-sky-400" />, task: 'Link Twitter', bonus: '+10' },
                  { icon: <Heart className="w-5 h-5 text-rose-400" />, task: 'Like Post', bonus: '+5' },
                  { icon: <Repeat2 className="w-5 h-5 text-emerald-400" />, task: 'Retweet', bonus: '+5' },
                  { icon: <Users className="w-5 h-5 text-violet-400" />, task: 'Refer Friend', bonus: '+20' },
                ].map((t) => (
                  <div key={t.task} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex justify-center mb-1">{t.icon}</div>
                    <div className="text-white/60 text-[10px] font-semibold mt-0.5">{t.task}</div>
                    <div className="text-orange-400 text-[11px] font-black flex items-center justify-center gap-0.5">
                      {t.bonus} <Carrot className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 px-5 text-center">
          <div className="mb-6 flex justify-center">
            <BunnyPixelArt animate={false} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)', textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
            Ready to Hop?
          </h2>
          <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
            Join thousands of players earning real rewards every run. Connect your wallet and start collecting carrots.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary mx-auto text-lg"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Playing Now</span>
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 py-8 px-5 text-center">
          <div className="text-white/20 text-xs">
            &copy; 2024 Bunny Hop &middot; Built on Web3 &middot; <span className="text-orange-500/60">Earn while you play</span>
          </div>
        </footer>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
