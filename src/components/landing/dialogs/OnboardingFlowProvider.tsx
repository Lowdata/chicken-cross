'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { Web3Provider } from '@/components/Web3Provider';
import OnboardingFlow from './OnboardingFlow';

export default function OnboardingFlowProvider({ onClose }: { onClose: () => void }){
  return (
    <Web3Provider>
      <OnboardingFlow onClose={onClose} />
    </Web3Provider>
  );
}
