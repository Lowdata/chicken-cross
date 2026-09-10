'use client';

import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3/wagmiConfig';

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            ...darkTheme({
              accentColor: '#f7a4ef',
              accentColorForeground: '#4a1560',
              borderRadius: 'medium',
              overlayBlur: 'large',
            }),
            fonts: { body: 'var(--body)' },
            colors: {
              ...darkTheme().colors,
              accentColor: '#f7a4ef',
              accentColorForeground: '#4a1560',
              modalBackground: '#1c1140',
              modalBorder: 'rgba(255,255,255,.10)',
              modalText: '#ffffff',
              modalTextSecondary: 'rgba(255,255,255,.62)',
              modalTextDim: 'rgba(255,255,255,.42)',
              actionButtonBorder: 'rgba(255,255,255,.12)',
              actionButtonBorderMobile: 'rgba(255,255,255,.12)',
              actionButtonSecondaryBackground: 'rgba(255,255,255,.06)',
              closeButton: 'rgba(255,255,255,.85)',
              closeButtonBackground: 'rgba(255,255,255,.06)',
              generalBorder: 'rgba(255,255,255,.10)',
              menuItemBackground: 'rgba(255,255,255,.06)',
              profileAction: 'rgba(255,255,255,.06)',
              profileActionHover: 'rgba(255,255,255,.11)',
              profileForeground: '#1c1140',
              selectedOptionBorder: '#f7a4ef',
              standby: '#ffe14d',
              connectButtonBackground: '#1c1140',
              connectButtonInnerBackground: 'rgba(255,255,255,.06)',
              connectButtonText: '#ffffff',
              connectButtonTextError: '#ff6fc4',
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
