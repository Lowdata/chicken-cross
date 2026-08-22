'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingModal } from '@/components/OnboardingModal';

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
   Reward Tier Badge
────────────────────────────────────────────── */
const TierBadge = ({
  icon, label, description, color
}: { icon: string; label: string; description: string; color: string }) => (
  <div className={`rounded-2xl p-4 border ${color} text-left transition-transform hover:scale-[1.02]`}>
    <div className="text-2xl mb-2">{icon}</div>
    <div className="font-black text-sm mb-1">{label}</div>
    <div className="text-[11px] opacity-75 leading-relaxed">{description}</div>
  </div>
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
            <span className="text-2xl" style={{ imageRendering: 'pixelated' }}>🐰</span>
            <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              BUNNY HOP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#how" className="text-white/60 hover:text-white text-xs font-semibold transition-colors hidden sm:block">How it works</a>
            <a href="#rewards" className="text-white/60 hover:text-white text-xs font-semibold transition-colors hidden sm:block">Rewards</a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-black transition-all active:scale-95 shadow-lg shadow-orange-900/40"
            >
              Play Now 🎮
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
            Dodge traffic • Collect carrots • Claim rewards
          </p>

          {/* CTA */}
          <div className="fade-up fade-up-3 flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="pixel-pulse relative px-8 py-4 rounded-2xl text-white font-black text-base sm:text-lg tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)', boxShadow: '0 8px 40px rgba(249,115,22,0.45)' }}
            >
              🎮 Play Now &amp; Earn Carrots
            </button>
            <a href="#how" className="px-6 py-3.5 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold text-sm transition-all">
              Learn More ↓
            </a>
          </div>

          {/* Social proof pills */}
          <div className="mt-10 flex flex-wrap gap-2 justify-center fade-up fade-up-4">
            {[
              { emoji: '🔒', text: 'Web3 Secured' },
              { emoji: '⚡', text: 'Instant Rewards' },
              { emoji: '📱', text: 'Mobile Ready' },
              { emoji: '🌍', text: 'Play Anywhere' },
            ].map((p) => (
              <span key={p.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold">
                {p.emoji} {p.text}
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
        <section id="how" className="py-20 px-5 sm:px-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              Three Hops to Earning
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01', emoji: '🎮', title: 'Hop Across',
                desc: 'Guide your pixel bunny across busy roads and rivers. Each hop forward scores points. Avoid cars — they hurt!'
              },
              {
                step: '02', emoji: '🥕', title: 'Collect Carrots',
                desc: 'Gather carrots scattered across the map. Hit 5+ in one run to qualify for FCFS rewards. Hit all 9 for guaranteed rare rewards.'
              },
              {
                step: '03', emoji: '💎', title: 'Claim Rewards',
                desc: 'Connect your wallet, complete tasks, and claim your Web3 rewards. Refer friends for bonus carrots and exclusive perks.'
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-3xl p-6 border border-white/10 hover:border-orange-500/30 transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="absolute -top-3 left-5 px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-black tracking-widest">{s.step}</div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.emoji}</div>
                <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REWARDS ── */}
        <section id="rewards" className="py-20 px-5 sm:px-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest mb-4">Reward Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
              How Many Carrots You Need
            </h2>
            <p className="text-white/40 text-sm mt-2">Every run can earn you a reward — if you hop fast enough.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TierBadge
              icon="🟤" label="1–4 Carrots: No Reward"
              description="You're warming up! Keep hopping and grab more carrots next run."
              color="bg-slate-800/50 border-slate-700/50 text-slate-300"
            />
            <TierBadge
              icon="⚡" label="5–8 Carrots: FCFS Tier"
              description="First-Come-First-Served! Submit your score early to claim from the reward pool."
              color="bg-orange-900/30 border-orange-700/50 text-orange-200"
            />
            <TierBadge
              icon="💎" label="9 Carrots: GUARANTEED"
              description="The 9th carrot has 1-in-100 spawn odds. Hit it and a guaranteed reward is yours — no racing needed."
              color="bg-violet-900/30 border-violet-700/50 text-violet-200"
            />
          </div>
        </section>

        {/* ── TASKS & EARN MORE ── */}
        <section className="py-20 px-5 sm:px-10 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(124,58,237,0.08) 100%)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-3xl mb-3 block">🎁</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)' }}>
                  Earn More With Tasks
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-md">
                  Beyond the game, complete social tasks to stack bonus carrots. Link your X/Twitter, like our launch post, retweet, and refer friends — each task unlocks extra rewards.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-[200px]">
                {[
                  { icon: '🐦', task: 'Link Twitter', bonus: '+10 🥕' },
                  { icon: '❤️', task: 'Like Post', bonus: '+5 🥕' },
                  { icon: '🔁', task: 'Retweet', bonus: '+5 🥕' },
                  { icon: '👥', task: 'Refer Friend', bonus: '+20 🥕' },
                ].map((t) => (
                  <div key={t.task} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
                    <div className="text-lg">{t.icon}</div>
                    <div className="text-white/60 text-[10px] font-semibold mt-0.5">{t.task}</div>
                    <div className="text-orange-400 text-[11px] font-black">{t.bonus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 px-5 text-center">
          <div className="mb-6">
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
            className="mx-auto px-10 py-4 rounded-2xl text-white font-black text-lg tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)', boxShadow: '0 8px 50px rgba(249,115,22,0.5)' }}
          >
            🐰 Start Playing Now
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 py-8 px-5 text-center">
          <div className="text-white/20 text-xs">
            © 2024 Bunny Hop · Built on Web3 · <span className="text-orange-500/60">Earn while you play</span>
          </div>
        </footer>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
