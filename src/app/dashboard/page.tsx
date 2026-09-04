'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Heart,
  Check,
  Copy,
  ArrowRight,
  HelpCircle,
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Home,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';

interface Task {
  id: string;
  title: string;
  reward: string;
  type: 'x-connect' | 'x-follow' | 'x-like' | 'x-retweet' | 'discord' | 'refer';
  completed: boolean;
  link?: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'x_connect',
    title: 'Connect your X',
    reward: '+1 heart',
    type: 'x-connect',
    completed: true,
  },
  {
    id: 'x_follow',
    title: 'Follow @bunnyhop on X',
    reward: '+1 heart',
    type: 'x-follow',
    completed: false,
    link: 'https://x.com',
  },
  {
    id: 'x_like',
    title: 'Like the launch post',
    reward: '+1 heart',
    type: 'x-like',
    completed: false,
    link: 'https://x.com',
  },
  {
    id: 'x_retweet',
    title: 'Retweet the announcement',
    reward: '+1 heart',
    type: 'x-retweet',
    completed: false,
    link: 'https://x.com',
  },
  {
    id: 'discord',
    title: 'Join the discord',
    reward: '+1 heart',
    type: 'discord',
    completed: false,
    link: 'https://discord.gg',
  },
  {
    id: 'refer',
    title: 'Refer friends to earn',
    reward: '+1 heart',
    type: 'refer',
    completed: false,
  },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [hearts, setHearts] = useState<number>(7);
  const [inviteCode] = useState<string>('PP978FDG');
  const [referralInput, setReferralInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('00:42:54');

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('bunny_dashboard_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      const savedHearts = localStorage.getItem('bunny_dashboard_hearts');
      if (savedHearts) {
        setHearts(parseInt(savedHearts, 10));
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  // Timer countdown until midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnightUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
      );
      const diff = midnightUtc.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleCopyCode = () => {
    soundEngine.playClick();
    triggerHaptic('tap');
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    showToast('Invite code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    soundEngine.playClick();
    triggerHaptic('tap');
    const url = typeof window !== 'undefined' ? `${window.location.origin}/dashboard?ref=${inviteCode}` : '';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCompleteTask = (task: Task) => {
    if (task.completed) return;

    soundEngine.playFanfare();
    triggerHaptic('carrot');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF9AD6', '#DA9DE7', '#B3C2FC'],
    });

    const updated = tasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t));
    const newHearts = hearts + 1;
    setTasks(updated);
    setHearts(newHearts);

    try {
      localStorage.setItem('bunny_dashboard_tasks', JSON.stringify(updated));
      localStorage.setItem('bunny_dashboard_hearts', newHearts.toString());
    } catch {}

    showToast(`Task completed! +1 Heart added ❤️`);

    if (task.link) {
      window.open(task.link, '_blank');
    }
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;

    soundEngine.playFanfare();
    triggerHaptic('fanfare');

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });

    const newHearts = hearts + 1;
    setHearts(newHearts);
    try {
      localStorage.setItem('bunny_dashboard_hearts', newHearts.toString());
    } catch {}

    showToast(`Referral redeemed! +1 Heart added ❤️`);
    setReferralInput('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-[#0b0718] text-white flex flex-col justify-between selection:bg-brand-pink selection:text-[#0b0718] relative overflow-x-hidden font-outfit">
      {/* Subtle ambient lighting orbs matching Figma */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-950/20 blur-[140px] pointer-events-none z-0" />

      {/* Top Floating Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#28184C] border border-brand-pink/40 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-brand-pink shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header Navigation ── */}
      <header className="relative z-20 max-w-6xl w-full mx-auto px-4 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left Chips */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Hearts Countdown Chip */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-xl px-3 sm:px-3.5 py-1.5 flex items-center gap-2 transition-all">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="font-bold text-xs sm:text-sm text-white">{hearts}</span>
              <span className="text-[11px] sm:text-xs text-white/50 font-medium lowercase">hearts</span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] sm:text-xs text-white/40 font-mono">resets in {timeRemaining}</span>
            </div>

            {/* Tasks Progress Chip */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 rounded-xl px-3 sm:px-3.5 py-1.5 flex items-center gap-2 transition-all">
              <span className="text-sm">🌸</span>
              <span className="text-[11px] sm:text-xs text-white/50 font-medium uppercase tracking-wider">tasks</span>
              <span className="font-dm-mono font-bold text-xs sm:text-sm text-brand-pink">
                {completedCount.toString().padStart(2, '0')}/06
              </span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden hidden xs:block">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Navigation & Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-white/80 hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs font-bold transition-all"
              title="Return to Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/game"
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 active:scale-95 p-2 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
              title="Hop into Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-brand-pink" />
              <span className="hidden sm:inline">Play</span>
            </Link>

            {/* Custom RainbowKit Button matching Figma node 197:2 & 244:2 */}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                if (!connected) {
                  return (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        triggerHaptic('tap');
                        openConnectModal();
                      }}
                      className="bg-gradient-to-r from-[#F9A8D4] to-[#F472B6] hover:brightness-105 active:scale-95 text-[#2E0854] font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-[0_4px_15px_rgba(244,114,182,0.35)] transition-all cursor-pointer"
                    >
                      connect wallet
                    </button>
                  );
                }
                return (
                  <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-dm-mono text-xs sm:text-sm text-white font-bold">
                      {account.displayName}
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        triggerHaptic('tap');
                        openAccountModal();
                      }}
                      className="text-white/40 hover:text-white text-xs font-semibold ml-1 cursor-pointer transition-colors"
                    >
                      log out
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Hero Branding Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-3">
            <Image
              src="/images/bunny-hop-logo.png"
              alt="Bunny Hop"
              width={340}
              height={100}
              priority
              className="mx-auto w-[240px] sm:w-[320px] h-auto object-contain drop-shadow-[0_12px_35px_rgba(255,154,214,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-white/60 text-xs sm:text-sm md:text-base font-medium tracking-wide">
            complete tasks, earn hearts, and play for the drop.
          </p>
        </div>

        {/* Two-Column Layout (Desktop 1440) / Stacked (Mobile 390) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ━━━ Left Column: EARN YOUR HEARTS (7 cols) ━━━ */}
          <div className="lg:col-span-7 bg-[#120a28]/85 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="font-bungee text-lg sm:text-2xl text-white tracking-wide uppercase">
                earn your hearts
              </h2>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  triggerHaptic('tap');
                  setHowToPlayOpen(true);
                }}
                className="bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-white/80 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-brand-pink" />
                <span>how to play</span>
              </button>
            </div>

            {/* Task list matching Figma node 197:2 */}
            <div className="space-y-2.5 sm:space-y-3 mb-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-white/[0.03] border-white/5 opacity-85'
                      : 'bg-white/[0.06] hover:bg-white/[0.09] border-white/10'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs sm:text-sm text-white">{task.title}</span>
                    <span className={`text-[11px] font-semibold mt-0.5 ${task.completed ? 'text-white/40' : 'text-brand-pink'}`}>
                      {task.completed ? `✓ ${task.reward}` : task.reward}
                    </span>
                  </div>

                  {task.completed ? (
                    <button
                      disabled
                      className="bg-white/10 text-white/40 font-bold text-xs px-4 py-1.5 rounded-xl cursor-default"
                    >
                      done
                    </button>
                  ) : task.type === 'refer' ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        triggerHaptic('tap');
                        handleCopyCode();
                      }}
                      className="bg-gradient-to-r from-[#F9A8D4] to-[#F472B6] hover:brightness-105 active:scale-95 text-[#2E0854] font-black text-xs px-4 py-1.5 rounded-xl shadow-[0_2px_10px_rgba(244,114,182,0.3)] transition-all cursor-pointer"
                    >
                      refer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="bg-gradient-to-r from-[#F9A8D4] to-[#F472B6] hover:brightness-105 active:scale-95 text-[#2E0854] font-black text-xs px-4 py-1.5 rounded-xl shadow-[0_2px_10px_rgba(244,114,182,0.3)] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>do it</span>
                      {task.link && <ExternalLink className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Counter & CTA */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-white/50 font-medium mb-4">
                you have <span className="text-white font-bold">{hearts} hearts</span> · 5 free every day
              </p>

              <Link
                href="/game"
                onClick={() => {
                  soundEngine.playClick();
                  triggerHaptic('hop');
                }}
                className="w-full bg-gradient-to-r from-[#F9A8D4] via-[#F472B6] to-[#E879F9] hover:brightness-110 active:scale-[0.99] text-[#2E0854] font-bungee text-base sm:text-xl py-4 rounded-2xl shadow-[0_8px_30px_rgba(244,114,182,0.4)] flex items-center justify-center gap-2 transition-all group"
              >
                <span>play bunny hop</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ━━━ Right Column: YOUR CODE (5 cols) ━━━ */}
          <div className="lg:col-span-5 bg-[#120a28]/85 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative">
            {/* Header with carrot badge */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-bungee text-lg sm:text-2xl text-white tracking-wide uppercase">
                  your code
                </h2>
                <p className="text-xs sm:text-sm text-white/60 font-medium mt-1">
                  each referral gives one heart to both of you.
                </p>
              </div>

              <div className="shrink-0 -mt-2 -mr-2">
                <Image
                  src="/images/dashboard-carrot-badge.png"
                  alt="Carrot Badge"
                  width={54}
                  height={54}
                  className="animate-bounce-subtle"
                />
              </div>
            </div>

            {/* Sub-card 1: YOUR INVITE CODE */}
            <div className="bg-[#1a0f38]/90 border border-white/10 rounded-2xl p-4 sm:p-5 my-5">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                your invite code
              </div>

              <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 mb-3">
                <span className="font-dm-mono text-xl sm:text-2xl font-bold tracking-widest text-white">
                  {inviteCode}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="bg-gradient-to-r from-[#F9A8D4] to-[#F472B6] hover:brightness-105 active:scale-95 text-[#2E0854] font-black text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'copied' : 'copy'}</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                <span>{copiedLink ? 'link copied!' : 'copy link'}</span>
              </button>
            </div>

            {/* Sub-card 2: HAVE A REFERRAL CODE? */}
            <div className="bg-[#1a0f38]/90 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                have a referral code?
              </div>

              <form onSubmit={handleRedeemCode} className="flex gap-2">
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="PP······"
                  maxLength={10}
                  className="flex-1 bg-white/[0.05] border border-white/15 focus:border-brand-pink focus:outline-none rounded-xl px-3 py-2 text-white font-dm-mono text-sm tracking-wider uppercase placeholder:text-white/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!referralInput.trim()}
                  className="bg-gradient-to-r from-[#F9A8D4] to-[#F472B6] hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[#2E0854] font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  redeem
                </button>
              </form>

              <p className="text-[11px] text-white/40 font-medium mt-2.5">
                one heart for them, one for you.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-6 text-center text-white/30 text-xs border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Bunny Hop. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/game" className="hover:text-white transition-colors">Game</Link>
            <button onClick={() => setHowToPlayOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              How to play
            </button>
          </div>
        </div>
      </footer>

      {/* ━━━ HOW TO PLAY MODAL (Figma node 290:301) ━━━ */}
      {howToPlayOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-[#130a2a] border-2 border-brand-pink/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative max-h-[92dvh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setHowToPlayOpen(false);
              }}
              className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="text-center mb-6">
              <h2 className="font-bungee text-2xl sm:text-3xl text-white tracking-wide uppercase">
                how to play
              </h2>
              <p className="text-xs sm:text-sm text-white/60 font-medium mt-1">
                everything you need, in 3 pages.
              </p>
            </div>

            {/* 3 Step Cards Grid matching Figma 290:301 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
              {/* Card 01: Hop Across */}
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center relative group hover:border-brand-pink/40 transition-all">
                <span className="self-start font-dm-mono text-[11px] font-bold text-white/35 mb-2">
                  01
                </span>
                <div className="w-20 h-20 bg-black/30 rounded-2xl flex items-center justify-center p-2 mb-3 shadow-inner">
                  <Image
                    src="/images/bunny-voxel-hero.png"
                    alt="Hop across"
                    width={64}
                    height={64}
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="font-bungee text-sm sm:text-base text-white mb-1.5 uppercase">
                  hop across
                </h3>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  guide your bunny across busy roads and rivers. every hop forward scores. cars hurt.
                </p>
              </div>

              {/* Card 02: Collect Carrots */}
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center relative group hover:border-brand-pink/40 transition-all">
                <span className="self-start font-dm-mono text-[11px] font-bold text-white/35 mb-2">
                  02
                </span>
                <div className="w-20 h-20 bg-black/30 rounded-2xl flex items-center justify-center p-2 mb-3 shadow-inner">
                  <Image
                    src="/images/dashboard-carrot-badge.png"
                    alt="Collect carrots"
                    width={56}
                    height={56}
                    className="object-contain group-hover:scale-110 group-hover:rotate-6 transition-transform"
                  />
                </div>
                <h3 className="font-bungee text-sm sm:text-base text-white mb-1.5 uppercase">
                  collect carrots
                </h3>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  carrots are scattered along the way. five in a run puts you in the reward pool.
                </p>
              </div>

              {/* Card 03: Claim Rewards */}
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center relative group hover:border-brand-pink/40 transition-all">
                <span className="self-start font-dm-mono text-[11px] font-bold text-white/35 mb-2">
                  03
                </span>
                <div className="w-20 h-20 bg-black/30 rounded-2xl flex items-center justify-center p-2 mb-3 shadow-inner">
                  <Image
                    src="/images/hero_planet_exact.png"
                    alt="Claim rewards"
                    width={56}
                    height={56}
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="font-bungee text-sm sm:text-base text-white mb-1.5 uppercase">
                  claim rewards
                </h3>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  connect your wallet, finish the tasks, claim what you earned. referrals pay too.
                </p>
              </div>
            </div>

            {/* Gradient Banner: Every run can pay */}
            <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/15 border border-amber-400/30 rounded-2xl p-4 mb-6 flex items-center gap-3.5">
              <span className="text-2xl shrink-0">🥕</span>
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm text-amber-200">
                  every run can pay.
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 font-medium">
                  you only need five carrots to be in the draw.
                </div>
              </div>
            </div>

            {/* Modal Got It Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                setHowToPlayOpen(false);
              }}
              className="w-full bg-gradient-to-r from-[#FBC7F4] via-[#F7A4EF] to-[#E474DB] hover:brightness-105 active:scale-[0.99] text-[#4A1560] font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
