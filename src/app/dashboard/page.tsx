'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Check, Sparkles, Gamepad2, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import FlipLabel from '@/components/landing/FlipLabel';
import HowToPlayDialog from '@/components/landing/dialogs/HowToPlayDialog';
import '@/styles/landing/tokens.css';
import '@/styles/landing/dialogs.css';
import '@/styles/landing/motion.css';
import '@/styles/landing/dashboard-ground.css';

interface Task {
  id: string;
  title: string;
  reward: string;
  type: 'x-connect' | 'x-follow' | 'x-like' | 'x-retweet' | 'discord' | 'refer';
  completed: boolean;
  link?: string;
}

const TASK_ICONS: Record<Task['type'], string> = {
  'x-connect': '/pp-figma/dash-task-x.webp',
  'x-follow': '/pp-figma/dash-task-x.webp',
  'x-like': '/pp-figma/dash-task-heart.webp',
  'x-retweet': '/pp-figma/dash-task-retweet.webp',
  discord: '/pp-figma/dash-task-discord.webp',
  refer: '/pp-figma/dash-task-people.webp',
};

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
  const [toastType, setToastType] = useState<'info' | 'reward' | 'error'>('info');
  const [timeRemaining, setTimeRemaining] = useState<string>('00:42:54');
  const groundRef = useRef<HTMLDivElement>(null);

  const closeHowToPlay = useCallback(() => {
    soundEngine.playClick();
    setHowToPlayOpen(false);
  }, []);

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
    }
  }, []);

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

  const showToast = (msg: string, type: 'info' | 'reward' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
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

    showToast(`Task completed! +1 Heart added`, 'reward');

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

    showToast(`Referral redeemed! +1 Heart added`, 'reward');
    setReferralInput('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div ref={groundRef} className="dashGround min-h-screen bg-[#0b0718] text-white flex flex-col justify-between selection:bg-brand-pink selection:text-[#0b0718] relative overflow-x-hidden font-outfit">
      <div className="dashGround__mesh" aria-hidden="true" />
      <div className="dashGround__grain" aria-hidden="true" />

      {toastMessage && (
        <div
          role="status"
          className={`dashToast tc-frosted fixed top-[calc(env(safe-area-inset-top)+4.5rem)] left-1/2 -translate-x-1/2 z-50 border text-white font-outfit font-bold text-xs sm:text-[13px] pl-4 pr-3 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2.5 ${toastType === 'reward' ? 'border-[#ffe14d]/40' : toastType === 'error' ? 'border-brand-pink/40' : 'border-white/15'}`}
        >
          <Sparkles className={`w-4 h-4 shrink-0 ${toastType === 'reward' ? 'text-[#ffe14d]' : toastType === 'error' ? 'text-brand-pink' : 'text-white/70'}`} />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 -mr-2 w-11 h-11 min-w-11 min-h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span aria-hidden="true" className="text-base leading-none">×</span>
          </button>
        </div>
      )}

      <header className="relative z-20 max-w-[1212px] w-full mx-auto px-4 pt-4 sm:pt-0 sm:h-16 before:absolute before:inset-y-0 before:left-1/2 before:-translate-x-1/2 before:w-screen before:bg-[rgba(12,6,40,0.72)] before:backdrop-blur-[20px] before:border-b before:border-white/10 before:-z-10 before:pointer-events-none">
        <div className="flex items-center justify-between gap-2 flex-wrap h-full">
          <div className="order-2 sm:order-1 w-full sm:w-auto flex items-center gap-2 sm:gap-3.5 flex-wrap">
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/[0.12] rounded-xl h-[34px] px-[15px] flex items-center gap-[9px]">
              <Image src="/pp-figma/dash-heart.webp" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
              <span className="font-bungee text-base leading-5 tracking-[0.16px] text-[#ffe14d]">{hearts}</span>
              <span className="text-xs font-bold uppercase tracking-[0.55px] text-white/55">hearts</span>
              <span className="text-xs text-white/45 font-dm-mono pl-1 hidden sm:inline">resets in {timeRemaining}</span>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-md border border-white/[0.12] rounded-xl h-[34px] px-[15px] flex items-center gap-[9px] sm:w-[320px]">
              <Image src="/pp-figma/dash-flower.webp" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
              <span className="text-xs font-bold uppercase tracking-[0.55px] text-white/55">tasks</span>
              <span className="font-bungee text-base leading-5 tracking-[0.16px] text-[#ffe14d]">
                {completedCount.toString().padStart(2, '0')}
              </span>
              <div className="flex-1 h-1.5 bg-white/[0.12] rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-[#ffe14d] transition-all duration-500"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-end flex-wrap gap-2 sm:gap-3.5">
            <Link
              href="/"
              className="bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white min-h-11 min-w-11 px-2 sm:px-3 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 text-xs font-bold transition-[transform,background-color,color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
              title="Return to Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/game"
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 min-h-11 min-w-11 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-[transform,background-color,color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
              title="Hop into Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-brand-pink" />
              <span className="hidden sm:inline">Play</span>
            </Link>

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
                      className="bg-gradient-to-b from-[#ff9ed6] to-[#f5479e] hover:brightness-105 text-white font-bold text-xs min-h-11 min-w-11 px-2 sm:px-3 rounded-xl transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 cursor-pointer"
                    >
                      <FlipLabel>connect wallet</FlipLabel>
                    </button>
                  );
                }
                return (
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="min-h-11 px-3 rounded-xl bg-white/[0.07] flex items-center font-dm-mono text-xs tracking-[0.48px] text-[#ffe14d]">
                      {account.displayName}
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        triggerHaptic('tap');
                        openAccountModal();
                      }}
                      className="min-h-11 min-w-11 px-2 sm:px-3 rounded-xl bg-gradient-to-b from-[#e6d6fd] via-[#dbc6fc] via-[46%] to-[#c89afc] shadow-[0_3px_0_rgba(120,85,195,0.45),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-3px_0_rgba(120,80,190,0.42)] text-[#3a1660] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:brightness-105 transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
                    >
                      <Image src="/pp-figma/dash-logout.svg" alt="" width={16} height={16} className="w-4 h-4" />
                      <span className="hidden sm:inline"><FlipLabel>log out</FlipLabel></span>
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1212px] w-full mx-auto px-4 pt-10 pb-8 flex-1 flex flex-col">
        <div className="text-left mb-7">
          <div className="relative mb-[26px]">
            <Image
              src="/images/bunny-hop-logo.png"
              alt="Bunny Hop"
              width={295}
              height={64}
              priority
              className="w-[240px] sm:w-[295px] h-auto object-contain drop-shadow-[0_12px_35px_rgba(255,154,214,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-white/60 text-sm sm:text-base leading-6">
            complete tasks, earn hearts, and play for the drop.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="order-2 lg:order-1 bg-[rgba(34,23,101,0.42)] ring-[1.5px] ring-inset ring-[rgba(255,143,208,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] rounded-2xl p-5 backdrop-blur-[22px] backdrop-saturate-[1.35] relative">
            <div className="flex items-center justify-between min-h-[60px] pb-4">
              <h2 className="font-bungee text-lg sm:text-xl leading-[22px] text-white tracking-[0.4px] uppercase whitespace-nowrap">
                earn your hearts
              </h2>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  triggerHaptic('tap');
                  setHowToPlayOpen(true);
                }}
                className="bg-white/[0.08] hover:bg-white/[0.12] text-white/90 hover:text-white min-h-11 px-4 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-[transform,background-color,color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 cursor-pointer"
              >
                <span className="w-5 h-5 rounded-[10px] bg-[#ffe14d] text-[#2a1f00] text-xs leading-3 font-bold flex items-center justify-center">?</span>
                <span>how to play</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[48px_1fr_auto] items-center gap-3.5 px-3.5 min-h-[54px] rounded-xl bg-[#170c31]"
                >
                  <span className="w-12 h-12 rounded-xl shadow-[0_3px_12px_rgba(8,3,26,0.6)]">
                    <Image src={TASK_ICONS[task.type]} alt="" width={48} height={48} className="w-12 h-12 object-contain" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm leading-5 text-white/[0.72]">{task.title}</span>
                    <span className={`text-xs font-bold leading-4 uppercase tracking-[1.44px] mt-[3px] ${task.completed ? 'text-[rgba(139,243,196,0.9)]' : 'text-[#ffd23f]'}`}>
                      {task.completed ? `✓ ${task.reward}` : task.reward}
                    </span>
                  </div>

                  {task.completed ? (
                    <button
                      disabled
                      className="bg-white/[0.08] text-white/75 text-sm h-11 min-w-11 px-4 rounded-xl cursor-default transition-[transform,background-color,color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] disabled:opacity-75 disabled:active:translate-y-0 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none"
                    >
                      <FlipLabel>done</FlipLabel>
                    </button>
                  ) : task.type === 'refer' ? (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        triggerHaptic('tap');
                        handleCopyCode();
                      }}
                      className="bg-gradient-to-b from-[#fbc7f4] via-[#f7a4ef] via-[46%] to-[#e474db] hover:brightness-105 text-[#4a1560] text-sm h-11 min-w-11 px-4 rounded-xl shadow-[0_3px_0_rgba(120,40,140,0.45),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-3px_0_rgba(150,45,140,0.45)] transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 cursor-pointer"
                    >
                      <FlipLabel>refer</FlipLabel>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="bg-gradient-to-b from-[#fbc7f4] via-[#f7a4ef] via-[46%] to-[#e474db] hover:brightness-105 text-[#4a1560] text-sm h-11 min-w-11 px-4 rounded-xl shadow-[0_3px_0_rgba(120,40,140,0.45),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-3px_0_rgba(150,45,140,0.45)] transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 cursor-pointer"
                    >
                      <FlipLabel>do it</FlipLabel>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center pt-[18px]">
              <p className="text-xs leading-4 text-white/55 mb-2">
                {hearts > 0
                  ? `you have ${hearts} hearts · 5 free every day`
                  : 'out of hearts. finish a task, or wait for the daily refill.'}
              </p>

              {hearts > 0 ? (
                <Link
                  href="/game"
                  onClick={() => {
                    soundEngine.playClick();
                    triggerHaptic('hop');
                  }}
                  className="w-full h-16 bg-gradient-to-b from-[#ff9ed6] via-[#ff74be] via-[46%] to-[#f4479f] hover:brightness-110 text-white font-bungee text-xl leading-6 tracking-[0.4px] uppercase px-[18px] rounded-xl shadow-[0_3px_0_rgba(160,40,110,0.5),inset_0_2px_0_rgba(255,255,255,0.72),inset_0_-3px_0_rgba(150,30,100,0.42)] flex items-center justify-center transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
                >
                  <FlipLabel>play bunny hop</FlipLabel>
                </Link>
              ) : (
                <span
                  role="button"
                  aria-disabled="true"
                  className="w-full h-16 bg-white/[0.07] text-white/45 opacity-50 font-bungee text-xl leading-6 tracking-[0.4px] uppercase px-[18px] rounded-xl flex items-center justify-center cursor-not-allowed select-none"
                >
                  play bunny hop
                </span>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 bg-[rgba(34,23,101,0.42)] ring-[1.5px] ring-inset ring-[rgba(255,143,208,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] rounded-2xl p-5 backdrop-blur-[22px] backdrop-saturate-[1.35] relative">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bungee text-xl leading-[22px] text-white tracking-[0.4px] uppercase min-h-[60px] pb-4 flex items-center">
                  your code
                </h2>
                <p className="text-xs leading-4 text-white/55 pb-4">
                  each referral gives one heart to both of you.
                </p>
              </div>

              <div className="shrink-0 -mt-1">
                <Image
                  src="/pp-figma/dash-carrot.webp"
                  alt="Carrot Badge"
                  width={56}
                  height={57}
                  className="w-14 h-[57px] object-cover opacity-90 animate-bounce-subtle"
                />
              </div>
            </div>

            <div className="bg-[#111033] rounded-xl px-4 py-3.5">
              <div className="text-xs leading-[15px] font-bold uppercase tracking-[1px] text-white/55">
                your invite code
              </div>

              <div className="flex items-center justify-between h-[54px] pt-2.5">
                <span className="font-dm-mono text-xl leading-7 tracking-[2px] text-white">
                  {inviteCode}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="min-h-11 min-w-11 px-1.5 text-[#ffe14d] text-xs font-semibold flex items-center gap-[7px] cursor-pointer hover:brightness-110 transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
                >
                  {copiedCode ? <Check className="w-5 h-5" /> : <Image src="/pp-figma/dash-copy.svg" alt="" width={20} height={20} className="w-5 h-5" />}
                  <FlipLabel>{copiedCode ? 'copied' : 'copy'}</FlipLabel>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full h-11 mt-3 bg-gradient-to-b from-[#b79efc] via-[#a688fa] via-[46%] to-[#8763f7] hover:brightness-105 text-white text-sm px-[18px] rounded-xl shadow-[0_3px_0_rgba(70,40,170,0.5),inset_0_2px_0_rgba(255,255,255,0.75),inset_0_-3px_0_rgba(60,30,150,0.45)] transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink && <Check className="w-4 h-4" />}
                <FlipLabel>{copiedLink ? 'link copied!' : 'copy link'}</FlipLabel>
              </button>
            </div>

            <div className="bg-[#111033] rounded-xl px-4 py-3.5">
              <div className="text-xs leading-[15px] font-bold uppercase tracking-[1px] text-white/55">
                have a referral code?
              </div>

              <form onSubmit={handleRedeemCode} className="flex gap-2.5 pt-2.5">
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="PP······"
                  maxLength={10}
                  className="flex-1 min-w-0 h-11 bg-[#1f1a3e] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] focus:shadow-[inset_0_0_0_1px_var(--bh-accent)] focus:outline-none rounded-xl px-3.5 text-white font-dm-mono text-sm tracking-[1.4px] uppercase placeholder:text-white/[0.32] transition-[box-shadow,color,background-color] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
                />
                <button
                  type="submit"
                  disabled={!referralInput.trim()}
                  className="bg-gradient-to-b from-[#e6d6fd] via-[#dbc6fc] via-[46%] to-[#c89afc] enabled:hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-[#3a1660] text-sm h-11 px-4 rounded-xl shadow-[0_3px_0_rgba(120,85,195,0.45),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-3px_0_rgba(120,80,190,0.42)] transition-[transform,filter,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] enabled:active:translate-y-px enabled:active:scale-[0.96] enabled:active:duration-[90ms] enabled:active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:enabled:active:translate-y-0 motion-reduce:enabled:active:scale-100 cursor-pointer"
                >
                  <FlipLabel>redeem</FlipLabel>
                </button>
              </form>

              <p className="text-xs leading-4 text-white/55 pt-2.5">
                one heart for them, one for you.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-white/30 text-xs border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Bunny Hop. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="min-h-11 min-w-11 inline-flex items-center justify-center hover:text-white transition-[transform,color] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100">Home</Link>
            <Link href="/game" className="min-h-11 min-w-11 inline-flex items-center justify-center hover:text-white transition-[transform,color] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100">Game</Link>
            <button onClick={() => setHowToPlayOpen(true)} className="min-h-11 hover:text-white transition-[transform,color] duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] active:translate-y-px active:scale-[0.96] active:duration-[90ms] active:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bh-accent)] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 cursor-pointer">
              How to play
            </button>
          </div>
        </div>
      </footer>

      <HowToPlayDialog open={howToPlayOpen} onClose={closeHowToPlay} />
    </div>
  );
}
