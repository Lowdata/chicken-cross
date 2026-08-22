'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  XSquare,
  Heart,
  Share2,
  Users,
  Copy,
  Check,
  Gift,
  Star,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';

interface UserProfile {
  walletAddress: string;
  twitterHandle: string | null;
  lives: number;
  carrots: number;
  rewards: RewardEntry[];
  completedTasks: string[];
  referralCode: string;
  referralCount: number;
}

interface RewardEntry {
  id: string;
  tier: 'fcfs' | 'guaranteed';
  carrotsCollected: number;
  runScore: number;
  earnedAt: string;
  txHash: string | null;
  claimCode: string | null;
}

interface TasksRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
}

const TWITTER_LIKE_URL = 'https://twitter.com/intent/like?tweet_id=YOUR_TWEET_ID';
const TWITTER_RETWEET_URL = 'https://twitter.com/intent/retweet?tweet_id=YOUR_TWEET_ID';
const TWITTER_POST_URL = 'https://twitter.com/BunnyHopGame';

export const TasksRewardsModal: React.FC<TasksRewardsModalProps> = ({ isOpen, onClose, address }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards' | 'profile'>('tasks');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [twitterInput, setTwitterInput] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user?address=${address}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isOpen && address) {
      fetchUser();
    }
  }, [isOpen, address, fetchUser]);

  const handleCopyReferral = () => {
    if (!user?.referralCode) return;
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const completeTask = async (task: string) => {
    if (!address || !user) return;
    if (user.completedTasks?.includes(task)) return;

    // Validation before submit
    if (task === 'link_twitter' && !twitterInput.trim()) {
      setTaskError('Please enter your Twitter handle');
      return;
    }
    if (task === 'refer_friend' && !referralInput.trim()) {
      setTaskError('Please enter a referral code');
      return;
    }

    setSubmittingTask(task);
    setTaskError(null);
    setTaskSuccess(null);

    try {
      const body: Record<string, string> = { address, task };
      if (task === 'link_twitter') body.twitterHandle = twitterInput.trim().replace('@', '');
      if (task === 'refer_friend') body.referralCode = referralInput.trim();

      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setTaskSuccess(task);
        soundEngine.playCarrot();
        triggerHaptic('fanfare');
        await fetchUser();
      } else {
        setTaskError(data.error || 'Failed to complete task');
      }
    } catch {
      setTaskError('Network error. Please try again.');
    } finally {
      setSubmittingTask(null);
    }
  };

  if (!isOpen) return null;

  const isDone = (task: string) => user?.completedTasks?.includes(task) || false;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="modal-container !p-0 w-full sm:max-w-md max-h-[92dvh] flex flex-col !rounded-b-none sm:!rounded-b-[var(--radius-modal)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-brand-orange/10 to-brand-purple/10 shrink-0">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-orange" />
              Tasks & Rewards
            </h2>
            <p className="text-[11px] text-white/50 font-medium mt-0.5">Complete tasks to earn 🥕 carrots & lives</p>
          </div>
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-brand-surface shrink-0">
          {(['tasks', 'rewards', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { soundEngine.playClick(); setActiveTab(tab); setTaskError(null); setTaskSuccess(null); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'text-brand-orange border-b-2 border-brand-orange bg-brand-orange/5'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab === 'tasks' ? '📋 Tasks' : tab === 'rewards' ? '🏆 Rewards' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-brand-dark">
          {/* No wallet connected */}
          {!address && (
            <div className="p-8 text-center">
              <Shield className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-sm font-bold text-white/50">Connect your wallet to access tasks & rewards</p>
            </div>
          )}

          {/* Loading */}
          {address && loading && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-white/40 font-medium">Loading your profile...</p>
            </div>
          )}

          {/* TASKS TAB */}
          {address && !loading && activeTab === 'tasks' && user && (
            <div className="p-5 space-y-4">
              {taskError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-3 rounded-xl">
                  ⚠️ {taskError}
                </div>
              )}
              {taskSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-xl animate-fade-in">
                  ✅ Task completed! Rewards added to your account.
                </div>
              )}

              {/* Link Twitter */}
              <TaskCard
                icon={<XSquare className="w-5 h-5" />}
                iconBg="bg-sky-500/10 text-sky-400"
                title="Link Your Twitter"
                description="Connect your X/Twitter account"
                reward="+2 ❤️ Lives · +10 🥕 Carrots"
                done={isDone('link_twitter')}
              >
                {!isDone('link_twitter') && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="@YourTwitterHandle"
                      value={twitterInput}
                      onChange={(e) => setTwitterInput(e.target.value)}
                      className="w-full text-xs border-2 border-white/10 bg-brand-surface rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-400 font-medium text-white placeholder:text-white/20 transition-colors"
                    />
                    <div className="flex gap-2">
                      <a
                        href={TWITTER_POST_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg py-2 hover:bg-sky-500/20 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Follow Us
                      </a>
                      <button
                        onClick={() => completeTask('link_twitter')}
                        disabled={submittingTask === 'link_twitter'}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-sky-500 hover:bg-sky-600 rounded-lg py-2 transition-colors disabled:opacity-50"
                      >
                        {submittingTask === 'link_twitter' ? '...' : <><Check className="w-3.5 h-3.5" /> Verify</>}
                      </button>
                    </div>
                  </div>
                )}
              </TaskCard>

              {/* Like Post */}
              <TaskCard
                icon={<Heart className="w-5 h-5" />}
                iconBg="bg-rose-500/10 text-rose-400"
                title="Like Our Announcement"
                description="Like our launch post on Twitter/X"
                reward="+1 ❤️ Life · +5 🥕 Carrots"
                done={isDone('like_post')}
              >
                {!isDone('like_post') && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={TWITTER_LIKE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => completeTask('like_post'), 3000)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-rose-500 hover:bg-rose-600 rounded-lg py-2.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Like Post & Claim
                    </a>
                  </div>
                )}
              </TaskCard>

              {/* Retweet */}
              <TaskCard
                icon={<Share2 className="w-5 h-5" />}
                iconBg="bg-emerald-500/10 text-emerald-400"
                title="Retweet & Spread the Hop"
                description="Retweet our post to earn rewards"
                reward="+1 ❤️ Life · +5 🥕 Carrots"
                done={isDone('retweet_post')}
              >
                {!isDone('retweet_post') && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={TWITTER_RETWEET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => completeTask('retweet_post'), 3000)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg py-2.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Retweet & Claim
                    </a>
                  </div>
                )}
              </TaskCard>

              {/* Refer a Friend */}
              <TaskCard
                icon={<Users className="w-5 h-5" />}
                iconBg="bg-brand-purple/10 text-brand-purple"
                title="Refer a Friend"
                description="Enter a referral code from a friend"
                reward="+3 ❤️ Lives · +20 🥕 Carrots"
                done={isDone('refer_friend')}
              >
                {!isDone('refer_friend') && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Enter referral code (e.g. ABCD1234)"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="w-full text-xs border-2 border-white/10 bg-brand-surface rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-purple font-mono tracking-wider uppercase text-white placeholder:text-white/20 transition-colors"
                    />
                    <button
                      onClick={() => completeTask('refer_friend')}
                      disabled={submittingTask === 'refer_friend'}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-brand-purple hover:bg-brand-purple-dark rounded-lg py-2.5 transition-colors disabled:opacity-50"
                    >
                      {submittingTask === 'refer_friend' ? '...' : <><ChevronRight className="w-3.5 h-3.5" /> Apply Code</>}
                    </button>
                  </div>
                )}
              </TaskCard>

              {/* Invite Link */}
              <div className="bg-brand-orange/10 border-2 border-brand-orange/20 rounded-2xl p-4 mt-2">
                <div className="text-[10px] uppercase font-black text-brand-orange mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Your Referral Link
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] bg-brand-dark border border-brand-orange/30 rounded-lg px-3 py-2 font-mono text-brand-orange truncate">
                    {user.referralCode ? `.../?ref=${user.referralCode}` : 'Loading...'}
                  </code>
                  <button
                    onClick={handleCopyReferral}
                    className="flex items-center gap-1.5 text-[11px] font-black text-white bg-brand-orange hover:bg-brand-orange-dark rounded-lg px-3 py-2 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-brand-orange/70 mt-2">
                  Friends who use your link &amp; enter your code earn you +10 🥕 extra!
                </p>
              </div>
            </div>
          )}

          {/* REWARDS TAB */}
          {address && !loading && activeTab === 'rewards' && user && (
            <div className="p-5 space-y-4">
              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3 text-center">
                  <Zap className="w-5 h-5 text-brand-orange mx-auto mb-1.5" />
                  <div className="text-[10px] font-black text-brand-orange uppercase">FCFS Tier</div>
                  <div className="text-[10px] text-brand-orange/70 font-medium">5-8 Carrots</div>
                </div>
                <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-3 text-center">
                  <Star className="w-5 h-5 text-brand-purple mx-auto mb-1.5" />
                  <div className="text-[10px] font-black text-brand-purple uppercase">Guaranteed</div>
                  <div className="text-[10px] text-brand-purple/70 font-medium">9 Carrots 🔥 1/100</div>
                </div>
              </div>

              {user.rewards?.length === 0 ? (
                <div className="text-center py-10">
                  <Gift className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white/50">No rewards yet</p>
                  <p className="text-[11px] text-white/30 mt-1">Collect 5+ carrots in a run to qualify!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(user.rewards || [])].reverse().map((reward) => (
                    <div
                      key={reward.id}
                      className={`rounded-2xl border-2 p-4 ${
                        reward.tier === 'guaranteed'
                          ? 'bg-brand-purple/5 border-brand-purple/30'
                          : 'bg-brand-orange/5 border-brand-orange/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {reward.tier === 'guaranteed' ? (
                            <Star className="w-5 h-5 text-brand-purple drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                          ) : (
                            <Zap className="w-5 h-5 text-brand-orange drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          )}
                          <div>
                            <div className={`text-xs font-black ${reward.tier === 'guaranteed' ? 'text-brand-purple' : 'text-brand-orange'}`}>
                              {reward.tier === 'guaranteed' ? '💎 GUARANTEED Reward' : '⚡ FCFS Reward'}
                            </div>
                            <div className="text-[11px] text-white/50 font-medium mt-0.5">
                              {reward.carrotsCollected} 🥕 · Score {reward.runScore}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          reward.txHash || reward.claimCode
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {reward.txHash || reward.claimCode ? 'CLAIMED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {address && !loading && activeTab === 'profile' && user && (
            <div className="p-5 space-y-4">
              {/* Wallet */}
              <div className="bg-brand-surface border border-white/10 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-black text-white/50 mb-1.5">Wallet Address</div>
                <div className="text-xs font-mono text-white/90 break-all">{user.walletAddress}</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Carrots" value={`${user.carrots} 🥕`} bg="bg-brand-orange/10 border-brand-orange/20" text="text-brand-orange" />
                <StatCard label="Daily Lives" value={`${user.lives} ❤️`} bg="bg-rose-500/10 border-rose-500/20" text="text-rose-400" />
                <StatCard label="Tasks Done" value={`${user.completedTasks?.length || 0} / 4`} bg="bg-emerald-500/10 border-emerald-500/20" text="text-emerald-400" />
                <StatCard label="Rewards Earned" value={`${user.rewards?.length || 0} 🏆`} bg="bg-brand-purple/10 border-brand-purple/20" text="text-brand-purple" />
              </div>

              {/* Twitter */}
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black text-sky-500 mb-1">Twitter / X</div>
                  <div className="text-xs font-bold text-sky-400">
                    {user.twitterHandle ? `@${user.twitterHandle}` : 'Not linked'}
                  </div>
                </div>
                <XSquare className={`w-5 h-5 ${user.twitterHandle ? 'text-sky-400' : 'text-white/20'}`} />
              </div>

              {/* Referral */}
              <div className="bg-brand-surface border border-white/10 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-black text-brand-orange mb-2">Your Referral Code</div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-lg font-black text-white tracking-widest">{user.referralCode}</code>
                  <button onClick={handleCopyReferral} className="flex items-center gap-1.5 text-[11px] font-bold text-brand-dark bg-brand-orange hover:bg-brand-orange-dark rounded-lg px-3 py-2 transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-white/50 mt-2">Friends referred: {user.referralCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components

const TaskCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  reward: string;
  done: boolean;
  children?: React.ReactNode;
}> = ({ icon, iconBg, title, description, reward, done, children }) => (
  <div className={`rounded-2xl border-2 p-4 transition-all ${done ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-brand-surface border-white/10 hover:border-brand-orange/50'}`}>
    <div className="flex items-start gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-black text-white">{title}</div>
          {done && <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">✓ Done</span>}
        </div>
        <div className="text-xs text-white/50 font-medium mt-1">{description}</div>
        <div className="text-[11px] font-black text-brand-orange mt-1.5">{reward}</div>
        {children}
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; bg: string; text: string }> = ({
  label, value, bg, text,
}) => (
  <div className={`rounded-xl border p-3.5 ${bg}`}>
    <div className="text-[10px] uppercase font-black text-white/50 mb-1">{label}</div>
    <div className={`text-base font-black ${text}`}>{value}</div>
  </div>
);

