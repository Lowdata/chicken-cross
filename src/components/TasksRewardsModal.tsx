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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[92dvh] flex flex-col shadow-2xl border-2 border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Tasks & Rewards
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Complete tasks to earn 🥕 carrots & lives</p>
          </div>
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white shrink-0">
          {(['tasks', 'rewards', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { soundEngine.playClick(); setActiveTab(tab); setTaskError(null); setTaskSuccess(null); }}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'tasks' ? '📋 Tasks' : tab === 'rewards' ? '🏆 Rewards' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* No wallet connected */}
          {!address && (
            <div className="p-6 text-center">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">Connect your wallet to access tasks & rewards</p>
            </div>
          )}

          {/* Loading */}
          {address && loading && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Loading your profile...</p>
            </div>
          )}

          {/* TASKS TAB */}
          {address && !loading && activeTab === 'tasks' && user && (
            <div className="p-4 space-y-3">
              {taskError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-2.5 rounded-xl">
                  ⚠️ {taskError}
                </div>
              )}
              {taskSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-2.5 rounded-xl animate-fade-in">
                  ✅ Task completed! Rewards added to your account.
                </div>
              )}

              {/* Link Twitter */}
              <TaskCard
                icon={<XSquare className="w-4 h-4" />}
                iconBg="bg-sky-100 text-sky-500"
                title="Link Your Twitter"
                description="Connect your X/Twitter account"
                reward="+2 ❤️ Lives · +10 🥕 Carrots"
                done={isDone('link_twitter')}
              >
                {!isDone('link_twitter') && (
                  <div className="mt-2.5 space-y-2">
                    <input
                      type="text"
                      placeholder="@YourTwitterHandle"
                      value={twitterInput}
                      onChange={(e) => setTwitterInput(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-400 font-medium"
                    />
                    <div className="flex gap-2">
                      <a
                        href={TWITTER_POST_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-200 rounded-lg py-1.5 hover:bg-sky-100 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Follow Us
                      </a>
                      <button
                        onClick={() => completeTask('link_twitter')}
                        disabled={submittingTask === 'link_twitter'}
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-sky-500 hover:bg-sky-600 rounded-lg py-1.5 transition-colors disabled:opacity-50"
                      >
                        {submittingTask === 'link_twitter' ? '...' : <><Check className="w-3 h-3" /> Verify</>}
                      </button>
                    </div>
                  </div>
                )}
              </TaskCard>

              {/* Like Post */}
              <TaskCard
                icon={<Heart className="w-4 h-4" />}
                iconBg="bg-rose-100 text-rose-500"
                title="Like Our Announcement"
                description="Like our launch post on Twitter/X"
                reward="+1 ❤️ Life · +5 🥕 Carrots"
                done={isDone('like_post')}
              >
                {!isDone('like_post') && (
                  <div className="mt-2.5 flex gap-2">
                    <a
                      href={TWITTER_LIKE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => completeTask('like_post'), 3000)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-rose-500 hover:bg-rose-600 rounded-lg py-2 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Like Post & Claim
                    </a>
                  </div>
                )}
              </TaskCard>

              {/* Retweet */}
              <TaskCard
                icon={<Share2 className="w-4 h-4" />}
                iconBg="bg-emerald-100 text-emerald-600"
                title="Retweet & Spread the Hop"
                description="Retweet our post to earn rewards"
                reward="+1 ❤️ Life · +5 🥕 Carrots"
                done={isDone('retweet_post')}
              >
                {!isDone('retweet_post') && (
                  <div className="mt-2.5 flex gap-2">
                    <a
                      href={TWITTER_RETWEET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => completeTask('retweet_post'), 3000)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Retweet & Claim
                    </a>
                  </div>
                )}
              </TaskCard>

              {/* Refer a Friend */}
              <TaskCard
                icon={<Users className="w-4 h-4" />}
                iconBg="bg-violet-100 text-violet-600"
                title="Refer a Friend"
                description="Enter a referral code from a friend"
                reward="+3 ❤️ Lives · +20 🥕 Carrots"
                done={isDone('refer_friend')}
              >
                {!isDone('refer_friend') && (
                  <div className="mt-2.5 space-y-2">
                    <input
                      type="text"
                      placeholder="Enter referral code (e.g. ABCD1234)"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 font-mono tracking-wider uppercase"
                    />
                    <button
                      onClick={() => completeTask('refer_friend')}
                      disabled={submittingTask === 'refer_friend'}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-black text-white bg-violet-500 hover:bg-violet-600 rounded-lg py-2 transition-colors disabled:opacity-50"
                    >
                      {submittingTask === 'refer_friend' ? '...' : <><ChevronRight className="w-3 h-3" /> Apply Code</>}
                    </button>
                  </div>
                )}
              </TaskCard>

              {/* Invite Link */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mt-1">
                <div className="text-[10px] uppercase font-black text-amber-600 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Your Referral Link
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 font-mono text-amber-900 truncate">
                    {user.referralCode ? `.../?ref=${user.referralCode}` : 'Loading...'}
                  </code>
                  <button
                    onClick={handleCopyReferral}
                    className="flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 mt-1.5">
                  Friends who use your link &amp; enter your code earn you +10 🥕 extra!
                </p>
              </div>
            </div>
          )}

          {/* REWARDS TAB */}
          {address && !loading && activeTab === 'rewards' && user && (
            <div className="p-4 space-y-3">
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mb-1">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-center">
                  <Zap className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <div className="text-[10px] font-black text-orange-700 uppercase">FCFS Tier</div>
                  <div className="text-[10px] text-orange-500 font-medium">5-8 Carrots</div>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-2.5 text-center">
                  <Star className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                  <div className="text-[10px] font-black text-violet-700 uppercase">Guaranteed</div>
                  <div className="text-[10px] text-violet-500 font-medium">9 Carrots 🔥 1/100</div>
                </div>
              </div>

              {user.rewards?.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">No rewards yet</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Collect 5+ carrots in a run to qualify!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...(user.rewards || [])].reverse().map((reward) => (
                    <div
                      key={reward.id}
                      className={`rounded-2xl border-2 p-3 ${
                        reward.tier === 'guaranteed'
                          ? 'bg-violet-50 border-violet-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {reward.tier === 'guaranteed' ? (
                            <Star className="w-4 h-4 text-violet-500" />
                          ) : (
                            <Zap className="w-4 h-4 text-orange-500" />
                          )}
                          <div>
                            <div className={`text-xs font-black ${reward.tier === 'guaranteed' ? 'text-violet-700' : 'text-orange-700'}`}>
                              {reward.tier === 'guaranteed' ? '💎 GUARANTEED Reward' : '⚡ FCFS Reward'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {reward.carrotsCollected} 🥕 · Score {reward.runScore}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          reward.txHash || reward.claimCode
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
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
            <div className="p-4 space-y-3">
              {/* Wallet */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <div className="text-[10px] uppercase font-black text-slate-400 mb-1">Wallet Address</div>
                <div className="text-xs font-mono text-slate-700 break-all">{user.walletAddress}</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Total Carrots" value={`${user.carrots} 🥕`} bg="bg-amber-50 border-amber-200" text="text-amber-800" />
                <StatCard label="Daily Lives" value={`${user.lives} ❤️`} bg="bg-rose-50 border-rose-200" text="text-rose-700" />
                <StatCard label="Tasks Done" value={`${user.completedTasks?.length || 0} / 4`} bg="bg-emerald-50 border-emerald-200" text="text-emerald-700" />
                <StatCard label="Rewards Earned" value={`${user.rewards?.length || 0} 🏆`} bg="bg-violet-50 border-violet-200" text="text-violet-700" />
              </div>

              {/* Twitter */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black text-sky-500 mb-0.5">Twitter / X</div>
                  <div className="text-xs font-bold text-sky-800">
                    {user.twitterHandle ? `@${user.twitterHandle}` : 'Not linked'}
                  </div>
                </div>
                <XSquare className={`w-4 h-4 ${user.twitterHandle ? 'text-sky-500' : 'text-slate-300'}`} />
              </div>

              {/* Referral */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <div className="text-[10px] uppercase font-black text-amber-600 mb-1.5">Your Referral Code</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-base font-black text-amber-900 tracking-widest">{user.referralCode}</code>
                  <button onClick={handleCopyReferral} className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-200 hover:bg-amber-300 rounded-lg px-2.5 py-1.5 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-amber-600 mt-1">Friends referred: {user.referralCount}</p>
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
  <div className={`rounded-2xl border-2 p-3 transition-all ${done ? 'bg-emerald-50 border-emerald-200 opacity-80' : 'bg-white border-slate-200 hover:border-amber-200'}`}>
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-black text-slate-800">{title}</div>
          {done && <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">✓ Done</span>}
        </div>
        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{description}</div>
        <div className="text-[10px] font-black text-amber-600 mt-1">{reward}</div>
        {children}
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; bg: string; text: string }> = ({
  label, value, bg, text,
}) => (
  <div className={`rounded-xl border p-2.5 ${bg}`}>
    <div className="text-[10px] uppercase font-black text-slate-400 mb-0.5">{label}</div>
    <div className={`text-sm font-black ${text}`}>{value}</div>
  </div>
);
