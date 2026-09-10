'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import DialogShell from './landing/dialogs/DialogShell';

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

const TABS: { key: 'tasks' | 'rewards' | 'profile'; label: string }[] = [
  { key: 'tasks', label: 'tasks' },
  { key: 'rewards', label: 'rewards' },
  { key: 'profile', label: 'profile' },
];

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const TaskRow: React.FC<{
  icon: string;
  title: string;
  reward: string;
  done: boolean;
  action?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ icon, title, reward, done, action, children }) => (
  <div className="trItem">
    <div className="dlgRow">
      <span className="dlgRow__ico">
        <img src={icon} alt="" aria-hidden="true" width={48} height={48} />
      </span>
      <div className="dlgRow__body">
        <span className="dlgRow__title">{title}</span>
        <span className={`dlgRow__reward${done ? ' is-done' : ''}`}>{done ? `✓ ${reward}` : reward}</span>
      </div>
      {done ? (
        <button type="button" className="dlgRow__act" disabled>done</button>
      ) : (
        action
      )}
    </div>
    {!done && children ? <div className="trExpand">{children}</div> : null}
  </div>
);

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
  const { openConnectModal } = useConnectModal();

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

  const isDone = (task: string) => user?.completedTasks?.includes(task) || false;
  const titleId = 'tasksTitle';

  return (
    <DialogShell open={isOpen} onClose={onClose} labelledBy={titleId} maxWidth={520} maxHeight={760} panelClassName="dlgShell__panel--stack">
      <div className="trDlg">
        <p className="dlgKicker">tasks &amp; rewards</p>
        <h2 className="dlgTitle" id={titleId}>earn your hearts</h2>
        <p className="trSub">complete tasks to earn carrots and lives.</p>

        <div className="dlgSteps dlgSteps--tabs" role="tablist" aria-label="Tasks and rewards sections">
          {TABS.map((tab, i) => (
            <React.Fragment key={tab.key}>
              {i > 0 && <span className="dlgSteps__divider" aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`dlgSteps__item${activeTab === tab.key ? ' is-now' : ''}`}
                onClick={() => { soundEngine.playClick(); setActiveTab(tab.key); setTaskError(null); setTaskSuccess(null); }}
              >
                {tab.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button
          className="dlgClose"
          onClick={() => { soundEngine.playClick(); onClose(); }}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="trScroll">
          {!address && (
            <div className="trEmpty">
              <img className="trEmpty__art" src="/pp-game/3d/bunny-01.png" alt="" aria-hidden="true" />
              <p className="trEmpty__copy">connect your wallet to access tasks &amp; rewards</p>
              <button className="dlgPrimary" onClick={() => openConnectModal?.()}>connect wallet</button>
            </div>
          )}

          {address && loading && (
            <div className="trEmpty">
              <span className="trSpin" aria-hidden="true" />
              <p className="trEmpty__copy">loading your profile…</p>
            </div>
          )}

          {address && !loading && activeTab === 'tasks' && user && (
            <div className="trList">
              {taskError && <p className="trBanner is-err" role="alert">{taskError}</p>}
              {taskSuccess && <p className="trBanner is-ok">task completed, rewards added to your account.</p>}

              <TaskRow
                icon="/pp-figma/dash-task-x.webp"
                title="link your X account"
                reward="+2 lives · +10 carrots"
                done={isDone('link_twitter')}
              >
                <label className="dlgField">
                  <span className="dlgField__input">
                    <span className="dlgField__at" aria-hidden="true">@</span>
                    <input
                      type="text"
                      placeholder="yourhandle"
                      aria-label="X handle"
                      autoComplete="off"
                      spellCheck={false}
                      value={twitterInput}
                      onChange={(e) => setTwitterInput(e.target.value)}
                    />
                  </span>
                </label>
                <div className="trActions">
                  <a
                    href={TWITTER_POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dlgRow__act dlgRow__act--quiet"
                  >
                    follow us
                  </a>
                  <button
                    type="button"
                    onClick={() => completeTask('link_twitter')}
                    disabled={submittingTask === 'link_twitter'}
                    className="dlgRow__act"
                  >
                    {submittingTask === 'link_twitter' ? 'verifying…' : 'verify'}
                  </button>
                </div>
              </TaskRow>

              <TaskRow
                icon="/pp-figma/dash-task-heart.webp"
                title="like the launch post"
                reward="+1 life · +5 carrots"
                done={isDone('like_post')}
                action={
                  <a
                    href={TWITTER_LIKE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => completeTask('like_post'), 3000)}
                    className="dlgRow__act"
                  >
                    like it
                  </a>
                }
              />

              <TaskRow
                icon="/pp-figma/dash-task-retweet.webp"
                title="repost and spread the hop"
                reward="+1 life · +5 carrots"
                done={isDone('retweet_post')}
                action={
                  <a
                    href={TWITTER_RETWEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => completeTask('retweet_post'), 3000)}
                    className="dlgRow__act"
                  >
                    repost
                  </a>
                }
              />

              <TaskRow
                icon="/pp-figma/dash-task-people.webp"
                title="refer a friend"
                reward="+3 lives · +20 carrots"
                done={isDone('refer_friend')}
              >
                <label className="dlgField">
                  <span className="dlgField__input">
                    <input
                      type="text"
                      placeholder="referral code"
                      aria-label="Referral code"
                      autoComplete="off"
                      spellCheck={false}
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                    />
                  </span>
                </label>
                <div className="trActions">
                  <button
                    type="button"
                    onClick={() => completeTask('refer_friend')}
                    disabled={submittingTask === 'refer_friend'}
                    className="dlgRow__act"
                  >
                    {submittingTask === 'refer_friend' ? 'applying…' : 'apply code'}
                  </button>
                </div>
              </TaskRow>

              <div className="dlgSurface">
                <span className="dlgLabel">your referral link</span>
                <div className="trCodeRow">
                  <code className="trCode">
                    {user.referralCode ? `.../?ref=${user.referralCode}` : 'loading…'}
                  </code>
                  <button type="button" onClick={handleCopyReferral} className="dlgRow__act dlgRow__act--quiet">
                    {copied ? 'copied' : 'copy'}
                  </button>
                </div>
                <p className="trNote">friends who use your link and enter your code earn you 10 extra carrots.</p>
              </div>
            </div>
          )}

          {address && !loading && activeTab === 'rewards' && user && (
            <div className="trList">
              <div className="trGrid">
                <div className="dlgSurface trTier">
                  <span className="trTier__name">fcfs tier</span>
                  <span className="trTier__c">5 to 8 carrots in a run</span>
                </div>
                <div className="dlgSurface trTier">
                  <span className="trTier__name is-alt">guaranteed</span>
                  <span className="trTier__c">9 carrots in a run</span>
                </div>
              </div>

              {user.rewards?.length === 0 ? (
                <div className="trEmpty">
                  <img className="trEmpty__art" src="/pp-game/chest.png" alt="" aria-hidden="true" />
                  <p className="trEmpty__copy">no rewards yet — collect 5 or more carrots in a run to qualify.</p>
                </div>
              ) : (
                [...(user.rewards || [])].reverse().map((reward) => (
                  <div className="dlgRow" key={reward.id}>
                    <span className="dlgRow__ico">
                      <img src="/pp-figma/dash-carrot.webp" alt="" aria-hidden="true" width={48} height={48} />
                    </span>
                    <div className="dlgRow__body">
                      <span className="dlgRow__title">
                        {reward.tier === 'guaranteed' ? 'guaranteed reward' : 'fcfs reward'}
                      </span>
                      <span className="dlgRow__reward">
                        {reward.carrotsCollected} carrots · score {reward.runScore}
                      </span>
                    </div>
                    <span className={`dlgTag${reward.txHash || reward.claimCode ? ' is-done' : ''}`}>
                      {reward.txHash || reward.claimCode ? 'claimed' : 'pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {address && !loading && activeTab === 'profile' && user && (
            <div className="trList">
              <div className="dlgSurface">
                <span className="dlgLabel">wallet address</span>
                <code className="trCode">{user.walletAddress}</code>
              </div>

              <div className="trGrid">
                <div className="dlgSurface">
                  <span className="dlgLabel">total carrots</span>
                  <span className="trStat__val is-carrot">{user.carrots}</span>
                </div>
                <div className="dlgSurface">
                  <span className="dlgLabel">daily lives</span>
                  <span className="trStat__val is-life">{user.lives}</span>
                </div>
                <div className="dlgSurface">
                  <span className="dlgLabel">tasks done</span>
                  <span className="trStat__val is-done">{user.completedTasks?.length || 0} / 4</span>
                </div>
                <div className="dlgSurface">
                  <span className="dlgLabel">rewards earned</span>
                  <span className="trStat__val">{user.rewards?.length || 0}</span>
                </div>
              </div>

              <div className="dlgRow">
                <span className="dlgRow__ico">
                  <img src="/pp-figma/dash-task-x.webp" alt="" aria-hidden="true" width={48} height={48} />
                </span>
                <div className="dlgRow__body">
                  <span className="dlgRow__title">X account</span>
                  <span className={`dlgRow__reward${user.twitterHandle ? ' is-done' : ''}`}>
                    {user.twitterHandle ? `@${user.twitterHandle}` : 'not linked'}
                  </span>
                </div>
                <span className="dlgTag">{user.twitterHandle ? 'linked' : 'open'}</span>
              </div>

              <div className="dlgSurface">
                <span className="dlgLabel">your referral code</span>
                <div className="trCodeRow">
                  <code className="trCode">{user.referralCode}</code>
                  <button type="button" onClick={handleCopyReferral} className="dlgRow__act dlgRow__act--quiet">
                    {copied ? 'copied' : 'copy'}
                  </button>
                </div>
                <p className="trNote">friends referred: {user.referralCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogShell>
  );
};
