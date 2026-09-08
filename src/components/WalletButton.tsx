'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, AlertCircle } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';

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
                      triggerHaptic('tap');
                      openConnectModal();
                    }}
                    type="button"
                    className={`hud-pill flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 text-white font-outfit font-semibold text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer hover:bg-white/10 select-none ${
                      compact
                        ? 'px-2.5 py-1.5 text-xs'
                        : 'px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className={compact ? 'inline' : 'hidden xs:inline'}>
                      {compact ? 'Wallet' : 'Connect Wallet'}
                    </span>
                    <span className={compact ? 'hidden' : 'xs:hidden'}>Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      triggerHaptic('tap');
                      openChainModal();
                    }}
                    type="button"
                    className="hud-pill flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 text-white font-outfit font-semibold text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer hover:bg-white/10 text-[#ff8fd0]"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Wrong Net</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Chain Switcher Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      triggerHaptic('tap');
                      openChainModal();
                    }}
                    type="button"
                    title={chain.name ?? 'Chain'}
                    className="hud-pill flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 text-white font-outfit font-semibold text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer hover:bg-white/10"
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
                    <span className="text-[13px] font-semibold text-white/85 hidden md:inline">
                      {chain.name}
                    </span>
                  </button>

                  {/* Account / Address Pill */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      triggerHaptic('tap');
                      openAccountModal();
                    }}
                    type="button"
                    className="hud-pill flex items-center h-[34px] rounded-full px-[13px] gap-[7px] bg-[rgba(14,8,32,0.42)] backdrop-blur-[18px] backdrop-saturate-[1.35] border border-white/5 text-white font-outfit font-semibold text-[13px] whitespace-nowrap transition-all active:scale-95 cursor-pointer hover:bg-white/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#8bf3c4]" />
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
