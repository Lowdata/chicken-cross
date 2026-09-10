'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import FlipLabel from '@/components/landing/FlipLabel';
import DialogShell from './DialogShell';

type Step = 'wallet' | 'handle' | 'ready';

type Player = {
  walletAddress: string;
  twitterHandle: string | null;
  lives: number;
  carrots: number;
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wallet', label: 'wallet' },
  { key: 'handle', label: 'X handle' },
  { key: 'ready', label: 'ready' },
];

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StepTabs({ current }: { current: Step }){
  const at = STEPS.findIndex(s => s.key === current);
  return (
    <ol className="dlgSteps" aria-hidden="true">
      {STEPS.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 && <li className="dlgSteps__divider" />}
          <li className={'dlgSteps__item' + (i < at ? ' is-done' : i === at ? ' is-now' : '')}>
            {s.label}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

export default function OnboardingFlow({ open = true, onClose, onExited }: { open?: boolean; onClose: () => void; onExited?: () => void }){
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState<Step>('wallet');
  const [player, setPlayer] = useState<Player | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [handle, setHandle] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Extract ?ref= from URL query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref.trim().toUpperCase());
      }
    }
  }, []);

  const load = useCallback(async (addr: string) => {
    setBusy(true); setError('');
    try {
      // 1. Check existing verified session first to avoid annoying repeat prompts
      try {
        const sessRes = await fetch('/api/auth/session');
        const sessData = await sessRes.json();
        if (sessData.authenticated && sessData.address?.toLowerCase() === addr.toLowerCase()) {
          const res = await fetch(`/api/user?address=${addr}`);
          const data = await res.json();
          if (data.success && data.user){
            setPlayer(data.user);
            setStep(data.user.twitterHandle ? 'ready' : 'handle');
            return;
          }
        }
      } catch {}

      // 2. Request cryptographic nonce challenge to prove wallet ownership
      const nonceRes = await fetch(`/api/auth/nonce?address=${addr}`);
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok || !nonceData.message) {
        throw new Error(nonceData.error || 'Failed to initialize wallet verification');
      }

      // 3. Prompt user's wallet to sign the challenge
      const signature = await signMessageAsync({ message: nonceData.message });

      // 4. Verify signature on backend & create/fetch user session
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addr,
          message: nonceData.message,
          signature,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Wallet signature verification failed');
      }

      setPlayer(verifyData.user);
      setStep(verifyData.user?.twitterHandle ? 'ready' : 'handle');
    } catch (err: any) {
      console.error('Wallet verification error:', err);
      const isUserRejected =
        err?.message?.includes('rejected') ||
        err?.message?.includes('denied') ||
        err?.code === 4001;
      setError(
        isUserRejected
          ? 'Signature required to verify wallet ownership. Please reconnect.'
          : err?.message || 'Could not verify wallet. Try again.'
      );
      setStep('wallet');
    } finally {
      setBusy(false);
    }
  }, [signMessageAsync]);

  useEffect(() => {
    if (isConnected && address && step === 'wallet') load(address);
  }, [isConnected, address, step, load]);

  useEffect(() => {
    if (open && step === 'ready' && player){
      onClose();
      window.location.href = '/dashboard';
    }
  }, [onClose, open, player, step]);

  const confirmHandle = async () => {
    if (!address) return;
    if (!handle.trim()){ setError('Your X handle, so rewards can find you.'); return; }
    setBusy(true); setError('');
    try {
      const code = referralCode.trim().toUpperCase();

      // Pre-validate referral code against MongoDB if provided
      if (code) {
        const valRes = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}&address=${encodeURIComponent(address)}`);
        const valData = await valRes.json();
        if (!valData.valid) {
          setError(valData.error || 'Referral code not found. Please enter an existing code or leave blank.');
          setBusy(false);
          return;
        }
      }

      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          twitterHandle: handle.replace('@', '').trim(),
          referredBy: code || null,
        }),
      });
      const data = await res.json();
      if (data.success){ setPlayer(data.user); setStep('ready'); }
      else setError(data.error || 'That did not save. Try again.');
    } catch {
      setError('Could not reach the burrow. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const titleId = 'dlgOnboardingTitle';

  return (
    <DialogShell open={open} onClose={onClose} onExited={onExited} labelledBy={titleId} maxWidth={520} maxHeight={558}>
      <div className="obDlg">
      <p className="dlgKicker">access required</p>
      <h2 className="dlgTitle" id={titleId}>onboarding protocol</h2>
      <StepTabs current={step} />

      <button className="dlgClose" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      {step === 'wallet' && (
        <div className="dlgCard">
          <img className="dlgCard__icon" src="/pp-figma/dlg-shield.svg" alt="" aria-hidden="true" />
          <h3 className="dlgCard__heading">link your wallet</h3>
          <p className="dlgCard__lede">connect to keep your hearts, your runs and your place in the draw.</p>
          {error && <p className="dlgErr" role="alert">{error}</p>}
          <button className="dlgPrimary" onClick={() => openConnectModal?.()} disabled={busy}>
            {busy ? 'verifying…' : <FlipLabel>initialize connection</FlipLabel>}
          </button>
          <button className="dlgGhost" onClick={() => { onClose(); window.location.href = '/game'; }}><FlipLabel>skip for now</FlipLabel></button>
          <ul className="dlgPills">
            <li className="dlgPill">hearts saved</li>
            <li className="dlgPill">runs tracked</li>
            <li className="dlgPill">rewards claimable</li>
          </ul>
        </div>
      )}

      {step === 'handle' && (
        <div className="dlgCard">
          <img className="dlgCard__icon" src="/pp-figma/dlg-x-handle.svg" alt="" aria-hidden="true" />
          <h3 className="dlgCard__heading">add your X handle</h3>
          <p className="dlgCard__lede">so we can credit your hearts and pay out the referral.</p>
          <label className="dlgField">
            <span className="dlgField__input">
              <span className="dlgField__at" aria-hidden="true">@</span>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="yourhandle"
                autoComplete="off"
                spellCheck={false}
                aria-label="X handle"
                onKeyDown={e => e.key === 'Enter' && confirmHandle()}
              />
            </span>
          </label>
          <label className="dlgField">
            <span className="dlgField__input">
              <input
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                placeholder="referral code (optional)"
                autoComplete="off"
                spellCheck={false}
                aria-label="Referral code"
                onKeyDown={e => e.key === 'Enter' && confirmHandle()}
              />
            </span>
          </label>
          {error && <p className="dlgErr" role="alert">{error}</p>}
          <button className="dlgPrimary" onClick={confirmHandle} disabled={busy}>
            {busy ? 'saving…' : 'confirm handle'}
          </button>
          <button className="dlgGhost" onClick={() => { disconnect(); setStep('wallet'); }}>back</button>
        </div>
      )}
      </div>
    </DialogShell>
  );
}
