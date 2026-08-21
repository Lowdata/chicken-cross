import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from 'wagmi/chains';

// Read WalletConnect project ID or use a demo project ID
export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';

export const config = getDefaultConfig({
  appName: 'Bunny Hop Game',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, base, polygon, arbitrum, optimism, sepolia],
  ssr: true,
});
