'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

const Gate = lazy(() => import('./OnboardingProvider'));

export default function OnboardingGate(){
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onPlay = (e: Event) => { e.preventDefault?.(); setOpen(true); };
    document.addEventListener('pp:play', onPlay);
    return () => document.removeEventListener('pp:play', onPlay);
  }, []);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <Gate onClose={() => setOpen(false)} />
    </Suspense>
  );
}
