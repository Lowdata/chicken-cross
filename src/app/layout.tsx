import type { Metadata, Viewport } from 'next';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';

export const metadata: Metadata = {
  title: '🐰 Bunny Hop - 3D Web Game | Carrot Bonanza & Web3',
  description: 'Hop across busy roads & rivers, collect tasty carrots, and unlock awesome bunny skins in this fast-paced 3D arcade game with Web3 wallet support!',
  keywords: ['bunny hop', 'crossy road', 'three.js game', 'web game', 'next.js game', 'rabbit game', 'carrot collector', 'web3 game', 'rainbowkit', 'metamask'],
  authors: [{ name: 'Bunny Hop Game' }],
  openGraph: {
    title: '🐰 Bunny Hop - 3D Web Game',
    description: 'Hop across roads and rivers, gather carrots, and unlock legendary bunny skins!',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#a0e7e5',
};

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
      <body className="antialiased select-none overflow-hidden">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
