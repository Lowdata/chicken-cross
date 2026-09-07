'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { Web3Provider } from '@/components/Web3Provider';
import Onboarding from './Onboarding';

export default function OnboardingProvider({ onClose }: { onClose: () => void }){
  return (
    <Web3Provider>
      <Onboarding onClose={onClose} />
    </Web3Provider>
  );
}
