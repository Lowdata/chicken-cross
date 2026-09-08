'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { useCallback, useState } from 'react';
import { Web3Provider } from '@/components/Web3Provider';
import OnboardingFlow from './OnboardingFlow';

export default function OnboardingFlowProvider({ open: controlledOpen, onClose }: { open?: boolean; onClose: () => void }){
  const [internalOpen, setInternalOpen] = useState(true);
  const open = controlledOpen ?? internalOpen;
  const requestClose = useCallback(() => {
    if (controlledOpen === undefined) setInternalOpen(false);
    else onClose();
  }, [controlledOpen, onClose]);

  return (
    <Web3Provider>
      <OnboardingFlow open={open} onClose={requestClose} onExited={controlledOpen === undefined ? onClose : undefined} />
    </Web3Provider>
  );
}
