'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BUNNY_SKINS, BunnySkin } from '@/lib/game/types';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import DialogShell from './landing/dialogs/DialogShell';

interface SkinWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCarrots: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
}

type FilterTab = 'all' | 'unlocked' | 'locked';

const TOP_TIER = 'Mythic';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const SkinPreview: React.FC<{ skin: BunnySkin }> = ({ skin }) => {
  const style = {
    ['--skin-body' as string]: hex(skin.colors.body),
    ['--skin-ear' as string]: hex(skin.colors.earInner),
    ['--skin-nose' as string]: hex(skin.colors.nose),
    ...(skin.auraColor ? { ['--skin-aura' as string]: hex(skin.auraColor) } : {}),
  };
  return (
    <span className={`wdSkin${skin.auraColor ? ' has-aura' : ''}`} style={style} aria-hidden="true">
      <span className="wdSkin__art" />
      <span className="wdSkin__ear wdSkin__ear--l" />
      <span className="wdSkin__ear wdSkin__ear--r" />
      <span className="wdSkin__nose" />
    </span>
  );
};

export const SkinWardrobeModal: React.FC<SkinWardrobeModalProps> = ({
  isOpen,
  onClose,
  totalCarrots,
  unlockedSkins,
  selectedSkin,
  onSelectSkin,
  onUnlockSkin,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const titleId = 'skinsTitle';

  const handleUnlock = (skin: BunnySkin) => {
    if (totalCarrots >= skin.cost) {
      soundEngine.playFanfare();
      triggerHaptic('fanfare');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9900', '#ffd700', '#00e5ff', '#ff007f'],
      });
      onUnlockSkin(skin.id, skin.cost);
      onSelectSkin(skin.id);
    }
  };

  const handleSelect = (skinId: string) => {
    soundEngine.playClick();
    triggerHaptic('tap');
    onSelectSkin(skinId);
  };

  const handleClose = () => {
    soundEngine.playClick();
    triggerHaptic('tap');
    onClose();
  };

  const allSkins = Object.values(BUNNY_SKINS);
  const filteredSkins = allSkins.filter((skin) => {
    const isUnlocked = unlockedSkins.includes(skin.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `all ${allSkins.length}` },
    { key: 'unlocked', label: `unlocked ${unlockedSkins.length}` },
    { key: 'locked', label: `locked ${allSkins.length - unlockedSkins.length}` },
  ];

  return (
    <DialogShell open={isOpen} onClose={onClose} labelledBy={titleId} maxWidth={760} maxHeight={720} panelClassName="dlgShell__panel--stack">
      <div className="wdDlg">
        <p className="dlgKicker">wardrobe</p>
        <h2 className="dlgTitle" id={titleId}>pick your bunny</h2>
        <p className="trSub">snag carrots in your runs to unlock the rest.</p>

        <div className="dlgSteps dlgSteps--tabs" role="tablist" aria-label="Filter skins">
          {tabs.map((tab, i) => (
            <React.Fragment key={tab.key}>
              {i > 0 && <span className="dlgSteps__divider" aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
                className={`dlgSteps__item${filter === tab.key ? ' is-now' : ''}`}
                onClick={() => {
                  soundEngine.playClick();
                  triggerHaptic('tap');
                  setFilter(tab.key);
                }}
              >
                {tab.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button className="dlgClose" onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="wdBank">
          <span className="dlgLabel">carrot bank</span>
          <span className="wdBank__val">
            <img src="/pp-figma/dash-carrot.webp" alt="" aria-hidden="true" width={20} height={20} />
            {totalCarrots}
          </span>
        </div>

        <div className="wdGrid">
          {filteredSkins.length === 0 && <p className="wdEmpty">nothing here yet.</p>}
          {filteredSkins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = totalCarrots >= skin.cost;
            const tag = skin.tag || 'Standard';

            return (
              <div key={skin.id} className={`wdCard${isSelected ? ' is-on' : ''}`}>
                <div className="wdCard__head">
                  <SkinPreview skin={skin} />
                  <span className="wdCard__meta">
                    <span className="wdName">{skin.name}</span>
                    <span className={`dlgTag${tag === TOP_TIER ? ' is-top' : ''}`}>{tag}</span>
                  </span>
                </div>

                <p className="wdDesc">{skin.description}</p>

                <div className="wdFootRow">
                  {isUnlocked ? (
                    isSelected ? (
                      <span className="wdEquipped">equipped</span>
                    ) : (
                      <button type="button" className="dlgPrimary" onClick={() => handleSelect(skin.id)}>
                        equip
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className="dlgPrimary"
                      onClick={() => handleUnlock(skin)}
                      disabled={!canAfford}
                    >
                      unlock · {skin.cost} carrots
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="dlgPrimary wdDone" onClick={handleClose}>done</button>
      </div>
    </DialogShell>
  );
};
