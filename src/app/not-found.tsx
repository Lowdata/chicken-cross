'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

/* Sad Bunny Pixel Art SVG */
const SadBunny = () => (
  <svg
    viewBox="0 0 80 100"
    style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    className="w-36 h-44 sm:w-48 sm:h-60 drop-shadow-2xl"
    aria-label="Sad pixel art bunny"
  >
    {/* Left ear outer (droopy) */}
    <rect x="12" y="4" width="10" height="24" fill="#e8e8e0" transform="rotate(-15 17 16)" />
    <rect x="14" y="6" width="6" height="18" fill="#ffb3c6" transform="rotate(-15 17 15)" />
    {/* Right ear outer (droopy) */}
    <rect x="58" y="4" width="10" height="24" fill="#e8e8e0" transform="rotate(15 63 16)" />
    <rect x="60" y="6" width="6" height="18" fill="#ffb3c6" transform="rotate(15 63 15)" />
    {/* Head */}
    <rect x="8" y="24" width="64" height="36" fill="#f5f5f0" />
    <rect x="6" y="24" width="2" height="36" fill="#2a2a2a" />
    <rect x="72" y="24" width="2" height="36" fill="#2a2a2a" />
    <rect x="8" y="22" width="64" height="2" fill="#2a2a2a" />
    <rect x="8" y="60" width="64" height="2" fill="#2a2a2a" />
    {/* Sad eyes (curved down) */}
    <rect x="18" y="34" width="10" height="8" fill="#1a1a2e" />
    <rect x="20" y="34" width="4" height="3" fill="white" />
    <rect x="52" y="34" width="10" height="8" fill="#1a1a2e" />
    <rect x="54" y="34" width="4" height="3" fill="white" />
    {/* Tear drops */}
    <rect x="22" y="44" width="4" height="6" fill="#7dd3fc" rx={1} />
    <rect x="56" y="44" width="4" height="6" fill="#7dd3fc" rx={1} />
    {/* Blush */}
    <rect x="12" y="44" width="8" height="4" fill="#ffc2c9" />
    <rect x="60" y="44" width="8" height="4" fill="#ffc2c9" />
    {/* Nose */}
    <rect x="36" y="48" width="8" height="6" fill="#ffb3c6" />
    {/* Sad mouth (frown) */}
    <rect x="32" y="54" width="4" height="2" fill="#2a2a2a" />
    <rect x="44" y="54" width="4" height="2" fill="#2a2a2a" />
    <rect x="34" y="56" width="12" height="2" fill="#2a2a2a" />
    {/* Body */}
    <rect x="12" y="62" width="56" height="28" fill="#f5f5f0" />
    <rect x="10" y="62" width="2" height="28" fill="#2a2a2a" />
    <rect x="68" y="62" width="2" height="28" fill="#2a2a2a" />
    <rect x="12" y="90" width="56" height="2" fill="#2a2a2a" />
    {/* Belly */}
    <rect x="24" y="66" width="32" height="18" fill="#fffdf8" />
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
  </svg>
);

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0a2e 30%, #0a1628 60%, #0d1a12 100%)' }}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-purple/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* Sad Bunny */}
        <div className="animate-bounce-subtle">
          <SadBunny />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest">
          404 — Page Not Found
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl font-black text-white leading-tight"
          style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)', textShadow: '3px 3px 0 rgba(0,0,0,0.4)' }}
        >
          This burrow doesn&apos;t exist...
        </h1>

        {/* Description */}
        <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-sm">
          Looks like this path leads nowhere. Our bunny checked every carrot patch and couldn&apos;t find this page.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
          <Link
            href="/"
            className="btn-primary py-3 px-8 text-base flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/game"
            className="btn-secondary py-3 px-8 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Play Game</span>
          </Link>
        </div>

        {/* Fun footer text */}
        <p className="text-white/20 text-[11px] mt-4">
          Error 404 — Even the fastest hopper can&apos;t reach a page that doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}
