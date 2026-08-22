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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in"
        style={{ maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-orange-400 to-amber-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐰</span>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">
                {step === 'connect' && 'Connect to Play'}
                {step === 'setup' && "Welcome, New Hopper!"}
                {step === 'profile' && `Hey, ${user?.twitterHandle ? `@${user.twitterHandle}` : 'Hopper'}! 👋`}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {step === 'connect' && 'Link your wallet to earn rewards'}
                {step === 'setup' && 'Set up your profile to start earning'}
                {step === 'profile' && 'Ready to hop and collect carrots?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 px-5 mb-4">
          {(['connect', 'setup', 'profile'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                s === step ? 'bg-orange-400' :
                (step === 'setup' && s === 'connect') || (step === 'profile' && s !== 'profile') ? 'bg-emerald-400' :
                'bg-slate-100'
              }`} />
              {i < 2 && <div className={`w-1.5 h-1.5 rounded-full ${
                (step === 'setup' && i === 0) || (step === 'profile' && i <= 1) ? 'bg-emerald-400' : 'bg-slate-200'
              }`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-6">
          {/* ━━━ STEP 1: CONNECT WALLET ━━━ */}
          {step === 'connect' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-100 to-orange-50 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-violet-500" />
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Connect your Web3 wallet to save progress, collect carrots, and earn rewards from every game.
              </p>
              <button
                onClick={() => openConnectModal?.()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-sm shadow-lg hover:shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlay}
                className="mt-3 w-full py-2.5 rounded-2xl text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors"
              >
                Skip for now (play as guest)
              </button>
              {/* Benefits */}
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {[
                  { icon: '🥕', label: 'Save Carrots' },
                  { icon: '🎁', label: 'Earn Rewards' },
                  { icon: '🐰', label: 'Unlock Skins' },
                ].map((b) => (
                  <div key={b.label} className="bg-slate-50 rounded-2xl p-2.5 text-center">
                    <div className="text-lg mb-1">{b.icon}</div>
                    <div className="text-[10px] font-bold text-slate-500">{b.label}</div>
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
                  <div className="text-3xl animate-bounce mb-2">🐰</div>
                  <p className="text-sm text-slate-400">Setting up your profile...</p>
                </div>
              ) : (
                <>
                  {/* Wallet connected badge */}
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 truncate">
                      {address?.slice(0, 6)}...{address?.slice(-4)} connected
                    </span>
                    <button onClick={() => disconnect()} className="ml-auto text-[10px] text-slate-400 hover:text-red-400 transition-colors font-medium">
                      Disconnect
                    </button>
                  </div>

                  {/* Twitter input */}
                  <div className="mb-3">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <XSquare className="w-3.5 h-3.5 text-sky-500" />
                      Twitter / X Handle <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                      <input
                        type="text"
                        value={twitterInput}
                        onChange={(e) => {
                          setTwitterInput(e.target.value.replace('@', ''));
                          setError('');
                        }}
                        placeholder="YourTwitterHandle"
                        className="w-full pl-7 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-none text-sm font-semibold text-slate-800 bg-slate-50 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Used for task verification & reward claims</p>
                  </div>

                  {/* Referral input */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-orange-400" />
                      Referral Code <span className="text-slate-300 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCD1234"
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:outline-none text-sm font-mono font-bold text-slate-700 bg-slate-50 tracking-widest uppercase transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Got a code from a friend? Enter it for bonus carrots!</p>
                  </div>

                  {error && (
                    <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    onClick={handleSetupSubmit}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-lg hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isLoading ? (
                      <><span className="animate-spin">🐰</span> Setting up...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Create My Profile<ArrowRight className="w-4 h-4" /></>
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
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-center">
                  <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                  <div className="text-xl font-black text-rose-700">{user.lives}</div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase">Lives</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
                  <span className="text-lg">🥕</span>
                  <div className="text-xl font-black text-orange-700">{user.carrots}</div>
                  <div className="text-[10px] font-bold text-orange-400 uppercase">Carrots</div>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 text-center">
                  <Gift className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                  <div className="text-xl font-black text-violet-700">{user.rewards.length}</div>
                  <div className="text-[10px] font-bold text-violet-400 uppercase">Rewards</div>
                </div>
              </div>

              {/* Tasks progress */}
              <div className="bg-slate-50 rounded-2xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wide">Tasks</span>
                  <span className="text-[10px] font-bold text-orange-500">{user.completedTasks.length}/4 done</span>
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
                      <div key={task.id} className={`flex-1 rounded-xl p-2 text-center text-[10px] font-bold transition-all ${
                        done ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-400 border border-slate-100'
                      }`}>
                        <div className="text-sm">{done ? '✅' : task.icon}</div>
                        <div>{task.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral code */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">Your Referral Code</div>
                  <div className="text-lg font-black text-amber-800 tracking-widest font-mono">{user.referralCode}</div>
                  <div className="text-[10px] text-amber-500">{user.referralCount} friend{user.referralCount !== 1 ? 's' : ''} referred</div>
                </div>
                <button
                  onClick={copyReferral}
                  className="w-9 h-9 bg-amber-400 text-white rounded-xl flex items-center justify-center hover:bg-amber-500 active:scale-90 transition-all shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Reward tiers info */}
              {user.lives === 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-4 text-xs text-rose-700 font-semibold">
                  ❤️ You&apos;re out of lives! Wait for daily refresh or spend carrots for an extra life.
                </div>
              )}

              {/* Play CTA */}
              <button
                onClick={handlePlay}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-base shadow-xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Hop In! Let&apos;s Play 🐰
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="mt-2 w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}

          {/* Error display for non-setup steps */}
          {error && step !== 'setup' && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
