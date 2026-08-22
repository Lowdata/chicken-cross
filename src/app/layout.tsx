import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';

export const metadata: Metadata = {
  title: '🐰 Bunny Hop — Play, Collect Carrots & Earn Web3 Rewards',
  description: 'Bunny Hop is a free-to-play pixel arcade game with real Web3 rewards. Hop across roads, collect carrots, complete tasks, and claim prizes. Connect your wallet to start earning today.',
  keywords: ['bunny hop', 'web3 game', 'play to earn', 'pixel game', 'carrot game', 'crossy road', 'three.js game', 'next.js game', 'rabbit game', 'crypto game', 'nft game', 'rainbowkit', 'metamask'],
  authors: [{ name: 'Bunny Hop' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bunny Hop',
  },
  openGraph: {
    title: '🐰 Bunny Hop — Play & Earn Web3 Rewards',
    description: 'Hop across roads, collect carrots, and earn real Web3 rewards. Connect your wallet to start playing!',
    type: 'website',
    siteName: 'Bunny Hop',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🐰 Bunny Hop — Play & Earn Web3 Rewards',
    description: 'Hop across roads, collect carrots, and earn real Web3 rewards!',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#a0e7e5',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Web3Provider>{children}</Web3Provider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
