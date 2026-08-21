'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, AlertCircle } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';

interface WalletButtonProps {
  compact?: boolean;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ compact = false }) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      openConnectModal();
                    }}
                    type="button"
                    className={`hud-pill bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold shadow-md border-2 border-emerald-300/60 rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer select-none ${
                      compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{compact ? 'Wallet' : 'Connect Wallet'}</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      openChainModal();
                    }}
                    type="button"
                    className="hud-pill bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md border-2 border-rose-300 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Wrong Network</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-1.5">
                  {/* Chain Switcher Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      openChainModal();
                    }}
                    type="button"
                    title={chain.name ?? 'Chain'}
                    className="hud-pill bg-white/90 hover:bg-white backdrop-blur-md border-2 border-white/80 rounded-2xl px-2.5 py-1.5 shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                      {chain.name}
                    </span>
                  </button>

                  {/* Account / Address Pill */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      openAccountModal();
                    }}
                    type="button"
                    className="hud-pill bg-white/90 hover:bg-white backdrop-blur-md border-2 border-white/80 rounded-2xl px-3 py-1.5 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
