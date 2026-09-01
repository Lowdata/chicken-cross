import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';
import { Bungee, DM_Mono, Outfit } from 'next/font/google';

const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PongPong — A Cult For Degens & Collectors',
  description: 'Bouncing bunnies onchain. The bounce goes physical with PongPong. Build your bounce before it’s real.',
  keywords: ['pongpong', 'nft', 'crypto', 'bouncing bunnies', 'web3', 'collectors'],
  authors: [{ name: 'PongPong' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PongPong',
  },
  openGraph: {
    title: 'PongPong — A Cult For Degens & Collectors',
    description: 'Bouncing bunnies onchain.',
    type: 'website',
    siteName: 'PongPong',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PongPong',
    description: 'Bouncing bunnies onchain.',
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
    <html lang="en" className={`${bungee.variable} ${dmMono.variable} ${outfit.variable}`}>
      <body className="antialiased overflow-x-hidden font-outfit text-white bg-pong-surface">
        <Web3Provider>{children}</Web3Provider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
