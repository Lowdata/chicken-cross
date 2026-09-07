'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { APP } from '@/lib/landing/app';

type Step = 'connect' | 'setup' | 'profile';

type Player = {
  walletAddress: string;
  twitterHandle: string | null;
  lives: number;
  carrots: number;
  rewards: { tier: string; earnedAt: string }[];
  completedTasks: string[];
  referralCode: string;
  referralCount: number;
  referredBy: string | null;
};

const TASKS = [
  { id: 'link_twitter', label: 'Link X' },
  { id: 'follow',       label: 'Follow' },
  { id: 'referral',     label: 'Refer' },
];

const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);

export default function Onboarding({ onClose }: { onClose: () => void }){
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const [step, setStep] = useState<Step>('connect');
  const [player, setPlayer] = useState<Player | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [handle, setHandle] = useState('');
  const [invite, setInvite] = useState('');
  const [copied, setCopied] = useState(false);

  const panel = useRef<HTMLDivElement>(null);

  const load = useCallback(async (addr: string) => {
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/user?address=${addr}`);
      const data = await res.json();
      if (data.success && data.user){
        setPlayer(data.user);
        setStep(data.user.twitterHandle ? 'profile' : 'setup');
      } else {
        setStep('setup');
      }
    } catch {
      setError('Could not reach the burrow. Try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { if (isConnected && address && step === 'connect') load(address); },
           [isConnected, address, step, load]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button, input, a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape'){ onClose(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = Array.from(panel.current.querySelectorAll<HTMLElement>('button, input, a[href]'))
        .filter(el => !el.hasAttribute('disabled'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const lock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = lock;
      prev?.focus?.();
    };
  }, [onClose]);

  const save = async () => {
    if (!address) return;
    if (!handle.trim()){ setError('Your X handle, so rewards can find you.'); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          twitterHandle: handle.replace('@', '').trim(),
          referredBy: invite.trim().toUpperCase() || null,
        }),
      });
      const data = await res.json();
      if (data.success){ setPlayer(data.user); setStep('profile'); }
      else setError(data.error || 'That did not save. Try again.');
    } catch {
      setError('Could not reach the burrow. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    if (!player?.referralCode) return;
    navigator.clipboard.writeText(player.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const steps: Step[] = ['connect', 'setup', 'profile'];
  const at = steps.indexOf(step);

  return (
    <div className="onb" role="presentation"
         onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="onb__panel" ref={panel} role="dialog" aria-modal="true"
           aria-labelledby="onbTitle">

        <header className="onb__head">
          <p className="onb__kicker">
            {step === 'connect' && 'Step one of three'}
            {step === 'setup'   && 'Step two of three'}
            {step === 'profile' && 'You are in'}
          </p>
          <h2 className="onb__h" id="onbTitle">
            {step === 'connect' && 'BRING A WALLET'}
            {step === 'setup'   && 'NAME YOURSELF'}
            {step === 'profile' && 'READY TO HOP'}
          </h2>
          <button className="onb__x" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <ol className="onb__ticks" aria-hidden="true">
            {steps.map((s, i) => (
              <li key={s} className={'onb__tick' + (i < at ? ' is-done' : i === at ? ' is-now' : '')} />
            ))}
          </ol>
        </header>

        {step === 'connect' && (
          <div className="onb__body">
            <p className="onb__lede">
              Your wallet is the save file. It holds your carrots, your lives and
              whatever the burrow owes you.
            </p>
            <button className="btn --glass --primary onb__go" data-shine
                    onClick={() => openConnectModal?.()} disabled={busy}>
              {busy ? 'Checking…' : 'Connect wallet'}
            </button>
            <button className="onb__skip" onClick={onClose}>Not yet, keep looking around</button>
          </div>
        )}

        {step === 'setup' && (
          <div className="onb__body">
            {address && (
              <p className="onb__wallet">
                <span className="onb__dot" aria-hidden="true" />
                <span className="onb__addr">{short(address)}</span>
                <button className="onb__unlink" onClick={() => { disconnect(); setStep('connect'); }}>
                  disconnect
                </button>
              </p>
            )}

            <label className="onb__field">
              <span className="onb__label">X handle</span>
              <span className="onb__input">
                <i className="onb__at" aria-hidden="true">@</i>
                <input value={handle} onChange={e => setHandle(e.target.value)}
                       placeholder="yourhandle" autoComplete="off" spellCheck={false}
                       onKeyDown={e => e.key === 'Enter' && save()} />
              </span>
              <span className="onb__hint">How tasks get checked and rewards get paid.</span>
            </label>

            <label className="onb__field">
              <span className="onb__label">Invite code <em>optional</em></span>
              <span className="onb__input onb__input--code">
                <input value={invite} onChange={e => setInvite(e.target.value.toUpperCase())}
                       placeholder="ABCD1234" autoComplete="off" spellCheck={false}
                       maxLength={12} onKeyDown={e => e.key === 'Enter' && save()} />
              </span>
              <span className="onb__hint">Someone sent you one? It pays you both.</span>
            </label>

            {error && <p className="onb__err" role="alert">{error}</p>}

            <button className="btn --glass --primary onb__go" data-shine onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Create my burrow'}
            </button>
          </div>
        )}

        {step === 'profile' && player && (
          <div className="onb__body">
            <p className="onb__lede">
              {player.twitterHandle ? `@${player.twitterHandle}` : 'Hopper'}, the burrow is yours.
            </p>

            <dl className="onb__stats">
              <div><dt>Lives</dt><dd>{player.lives}</dd></div>
              <div><dt>Carrots</dt><dd>{player.carrots}</dd></div>
              <div><dt>Referred</dt><dd>{player.referralCount}</dd></div>
            </dl>

            <ul className="onb__tasks">
              {TASKS.map(t => {
                const done = player.completedTasks.includes(t.id)
                  || (t.id === 'link_twitter' && !!player.twitterHandle);
                return (
                  <li key={t.id} className={'onb__task' + (done ? ' is-done' : '')}>
                    <span className="onb__taskMark" aria-hidden="true">{done ? '✓' : '·'}</span>
                    {t.label}
                  </li>
                );
              })}
            </ul>

            <div className="onb__code">
              <span className="onb__label">Your invite code</span>
              <b className="onb__codeVal">{player.referralCode}</b>
              <button className="onb__copy" onClick={copy}>{copied ? 'copied' : 'copy'}</button>
            </div>

            <a className="btn --glass --primary onb__go" data-shine href={APP.game}>Play now</a>
            <button className="onb__skip" onClick={onClose}>Back to the site</button>
          </div>
        )}
      </div>
    </div>
  );
}
