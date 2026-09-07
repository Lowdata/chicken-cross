/* The wallet stack belongs to the routes that connect a wallet.

   It used to wrap the whole app from the root layout, so every visitor who
   only ever saw the landing still downloaded and hydrated wagmi, viem and
   RainbowKit — about 350KB gzipped of code the landing never calls. Nothing
   under src/components/landing imports wagmi; the dashboard and the game do.
   So the provider sits with them, and RainbowKit's stylesheet comes along,
   since it is only ever needed where its components render. */
import '@rainbow-me/rainbowkit/styles.css';
import { Web3Provider } from '@/components/Web3Provider';

export default function GameLayout({ children }: { children: React.ReactNode }){
  return <Web3Provider>{children}</Web3Provider>;
}
