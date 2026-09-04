'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import {
  X,
  Wallet,
  XSquare,
  ArrowRight,
  Gift,
  Heart,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

type Step = 'connect' | 'setup' | 'profile';

interface UserProfile {
  walletAddress: string;
  twitterHandle: string | null;
  lives: number;
  carrots: number;
  rewards: { tier: string; earnedAt: string }[];
  completedTasks: string[];
  referralCode: string;
  referralCount: number;
  referredBy: string | null;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const [step, setStep] = useState<Step>('connect');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [twitterInput, setTwitterInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // When wallet connects, fetch/create user
  const fetchUser = useCallback(async (addr: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/user?address=${addr}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        // New user = no twitter; existing = has profile
        setStep(data.user.twitterHandle ? 'profile' : 'setup');
      }
    } catch {
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address && step === 'connect') {
      fetchUser(address);
    }
  }, [isConnected, address, step, fetchUser]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setTwitterInput('');
      setReferralInput('');
      if (!isConnected) setStep('connect');
    }
  }, [isOpen, isConnected]);

  const handleSetupSubmit = async () => {
    if (!address) return;
    if (!twitterInput.trim()) {
      setError('Please enter your Twitter/X handle');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const handle = twitterInput.replace('@', '').trim();
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          twitterHandle: handle,
          referredBy: referralInput.trim().toUpperCase() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setStep('profile');
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    onClose();
    router.push('/game');
  };

  const copyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,25,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-container w-full max-w-md animate-fade-in !p-0"
        style={{ maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-brand-purple via-brand-orange to-brand-orange-dark" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-md">🐰</span>
            <div>
              <h2 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-fredoka)' }}>
                {step === 'connect' && 'Connect to Play'}
                {step === 'setup' && "Welcome, New Hopper!"}
                {step === 'profile' && `Hey, ${user?.twitterHandle ? `@${user.twitterHandle}` : 'Hopper'}! 👋`}
              </h2>
              <p className="text-xs text-white/50 font-medium mt-0.5">
                {step === 'connect' && 'Link your wallet to earn rewards'}
                {step === 'setup' && 'Set up your profile to start earning'}
                {step === 'profile' && 'Ready to hop and collect carrots?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 px-6 mb-6">
          {(['connect', 'setup', 'profile'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                s === step ? 'bg-brand-orange' :
                (step === 'setup' && s === 'connect') || (step === 'profile' && s !== 'profile') ? 'bg-emerald-500' :
                'bg-white/10'
              }`} />
              {i < 2 && <div className={`w-1.5 h-1.5 rounded-full ${
                (step === 'setup' && i === 0) || (step === 'profile' && i <= 1) ? 'bg-emerald-500' : 'bg-white/5'
              }`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* ━━━ STEP 1: CONNECT WALLET ━━━ */}
          {step === 'connect' && (
            <div className="text-center py-2">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-surface border border-white/10 flex items-center justify-center shadow-inner">
                <Wallet className="w-10 h-10 text-brand-purple" />
              </div>
              <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-[260px] mx-auto">
                Connect your Web3 wallet to save progress, collect carrots, and earn rewards from every game.
              </p>
              <button
                onClick={() => openConnectModal?.()}
                className="btn-primary w-full py-3.5 px-6 text-base"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlay}
                className="mt-4 w-full py-2.5 rounded-2xl text-white/40 text-xs font-semibold hover:text-white transition-colors"
              >
                Skip for now (play as guest)
              </button>
              {/* Benefits */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: '🥕', label: 'Save Carrots' },
                  { icon: '🎁', label: 'Earn Rewards' },
                  { icon: '🐰', label: 'Unlock Skins' },
                ].map((b) => (
                  <div key={b.label} className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                    <div className="text-xl mb-1.5">{b.icon}</div>
                    <div className="text-[10px] font-bold text-white/50">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━━ STEP 2: NEW USER SETUP ━━━ */}
          {step === 'setup' && (
            <div>
              {isLoading && !user ? (
                <div className="text-center py-8">
                  <div className="text-4xl animate-bounce mb-3">🐰</div>
                  <p className="text-sm text-white/50">Setting up your profile...</p>
                </div>
              ) : (
                <>
                  {/* Wallet connected badge */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 truncate">
                      {address?.slice(0, 6)}...{address?.slice(-4)} connected
                    </span>
                    <button onClick={() => disconnect()} className="ml-auto text-[10px] text-white/40 hover:text-red-400 transition-colors font-medium">
                      Disconnect
                    </button>
                  </div>

                  {/* Twitter input */}
                  <div className="mb-5">
                    <label className="text-xs font-black text-white/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <XSquare className="w-4 h-4 text-sky-400" />
                      Twitter / X Handle <span className="text-brand-orange">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">@</span>
                      <input
                        type="text"
                        value={twitterInput}
                        onChange={(e) => {
                          setTwitterInput(e.target.value.replace('@', ''));
                          setError('');
                        }}
                        placeholder="YourTwitterHandle"
                        className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-white/10 focus:border-brand-orange focus:outline-none text-sm font-semibold text-white bg-brand-dark transition-colors placeholder:text-white/20"
                      />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1.5">Used for task verification & reward claims</p>
                  </div>

                  {/* Referral input */}
                  <div className="mb-6">
                    <label className="text-xs font-black text-white/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-brand-orange" />
                      Referral Code <span className="text-white/30 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCD1234"
                      maxLength={10}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 focus:border-brand-orange focus:outline-none text-sm font-mono font-bold text-white bg-brand-dark tracking-widest uppercase transition-colors placeholder:text-white/20"
                    />
                    <p className="text-[10px] text-white/40 mt-1.5">Got a code from a friend? Enter it for bonus carrots!</p>
                  </div>

                  {error && (
                    <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    onClick={handleSetupSubmit}
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 px-6 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isLoading ? (
                      <><span className="animate-spin">🐰</span> Setting up...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> <span>Create My Profile</span><ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ━━━ STEP 3: RETURNING USER PROFILE ━━━ */}
          {step === 'profile' && user && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-center">
                  <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-black text-rose-400">{user.lives}</div>
                  <div className="text-[10px] font-bold text-rose-400/70 uppercase">Lives</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3.5 text-center">
                  <span className="text-xl inline-block mb-1">🥕</span>
                  <div className="text-2xl font-black text-orange-400">{user.carrots}</div>
                  <div className="text-[10px] font-bold text-orange-400/70 uppercase">Carrots</div>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-3.5 text-center">
                  <Gift className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-black text-violet-400">{user.rewards.length}</div>
                  <div className="text-[10px] font-bold text-violet-400/70 uppercase">Rewards</div>
                </div>
              </div>

              {/* Tasks progress */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-white/70 uppercase tracking-wide">Tasks</span>
                  <span className="text-[10px] font-bold text-brand-orange">{user.completedTasks.length}/4 done</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'link_twitter', label: 'Twitter', icon: '🐦' },
                    { id: 'like_post', label: 'Like', icon: '❤️' },
                    { id: 'retweet_post', label: 'RT', icon: '🔁' },
                    { id: 'referral', label: 'Refer', icon: '👥' },
                  ].map((task) => {
                    const done = user.completedTasks.includes(task.id) ||
                      (task.id === 'link_twitter' && !!user.twitterHandle);
                    return (
                      <div key={task.id} className={`flex-1 rounded-xl p-2.5 text-center text-[10px] font-bold transition-all ${
                        done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        <div className="text-base mb-1">{done ? '✅' : task.icon}</div>
                        <div>{task.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral code */}
              <div className="bg-gradient-to-r from-brand-orange/10 to-brand-purple/10 border border-brand-orange/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-brand-orange uppercase tracking-wider mb-1">Your Referral Code</div>
                  <div className="text-xl font-black text-white tracking-widest font-mono">{user.referralCode}</div>
                  <div className="text-[11px] text-white/50 mt-1">{user.referralCount} friend{user.referralCount !== 1 ? 's' : ''} referred</div>
                </div>
                <button
                  onClick={copyReferral}
                  className="w-10 h-10 bg-brand-orange/20 text-brand-orange rounded-xl flex items-center justify-center hover:bg-brand-orange/30 active:scale-90 transition-all border border-brand-orange/30"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Reward tiers info */}
              {user.lives === 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-5 text-xs text-rose-400 font-semibold leading-relaxed">
                  ❤️ You&apos;re out of lives! Wait for daily refresh or spend carrots for an extra life.
                </div>
              )}

              {/* Play CTA */}
              <button
                onClick={handlePlay}
                className="btn-primary w-full py-3.5 px-6 text-base"
              >
                <Zap className="w-5 h-5" />
                <span>Hop In! Let&apos;s Play 🐰</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="mt-4 w-full py-2 text-xs text-white/40 hover:text-white transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}

          {/* Error display for non-setup steps */}
          {error && step !== 'setup' && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
