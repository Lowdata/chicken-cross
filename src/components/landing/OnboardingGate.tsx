'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { lazy, Suspense, useEffect, useState } from 'react';

const Gate = lazy(() => import('./dialogs/OnboardingFlowProvider'));

export default function OnboardingGate(){
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onPlay = (e: Event) => { e.preventDefault?.(); setOpen(true); };
    document.addEventListener('pp:play', onPlay);

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => { void import('./dialogs/OnboardingFlowProvider'); }, { timeout: 4000 })
      : window.setTimeout(() => { void import('./dialogs/OnboardingFlowProvider'); }, 2500);

    return () => {
      document.removeEventListener('pp:play', onPlay);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, []);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <Gate onClose={() => setOpen(false)} />
    </Suspense>
  );
}
