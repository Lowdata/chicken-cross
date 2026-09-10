'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';
import { BUNNY_SKINS, DeathReason } from '@/lib/game/types';
import {
  MAX_DAILY_LIVES,
  EXTRA_LIFE_CARROT_COST,
  getRemainingTimeUntilMidnight,
} from '@/lib/game/livesManager';
import DialogShell from './landing/dialogs/DialogShell';
import RunStartDialog from './landing/dialogs/RunStartDialog';
import RunOverDialog from './landing/dialogs/RunOverDialog';

interface StartOverlayProps {
  onStart: () => void;
  onOpenWardrobe: () => void;
  selectedSkin: string;
  totalCarrots: number;
  lives: number;
  highScore: number;
  onBuyLife: () => void;
  onFreeRefill?: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  onStart,
  onOpenWardrobe,
  selectedSkin,
  totalCarrots,
  lives,
  highScore,
  onBuyLife,
  onFreeRefill,
}) => {
  const router = useRouter();
  const currentSkinObj = BUNNY_SKINS[selectedSkin] || BUNNY_SKINS.classic;
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(getRemainingTimeUntilMidnight().formatted);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOutOfLives = lives <= 0;
  const canAffordLife = totalCarrots >= EXTRA_LIFE_CARROT_COST;

  const refillAction = isOutOfLives
    ? canAffordLife
      ? {
          label: `Refill life (${EXTRA_LIFE_CARROT_COST} carrots)`,
          onClick: () => { soundEngine.playClick(); triggerHaptic('carrot'); onBuyLife(); },
        }
      : {
          label: 'Free refill (+5 lives)',
          onClick: () => {
            soundEngine.playClick();
            triggerHaptic('carrot');
            if (onFreeRefill) onFreeRefill();
            else onBuyLife();
          },
        }
    : undefined;

  return (
    <RunStartDialog
      onClose={() => router.push('/')}
      onPlay={() => { soundEngine.playClick(); triggerHaptic('hop'); onStart(); }}
      livesRemaining={lives}
      livesTotal={MAX_DAILY_LIVES}
      livesResetIn={timeLeft}
      bunnySkin={currentSkinObj.name}
      highScore={highScore}
      carrots={totalCarrots}
      outOfLives={isOutOfLives}
      refillAction={refillAction}
      onChangeSkin={() => { soundEngine.playClick(); triggerHaptic('tap'); onOpenWardrobe(); }}
    />
  );
};

interface GameOverOverlayProps {
  score: number;
  sessionCarrots: number;
  maxCarrots: number;
  rewardTier: 'none' | 'fcfs' | 'guaranteed';
  totalCarrots: number;
  highScore: number;
  isNewHigh: boolean;
  lives: number;
  deathReason?: DeathReason;
  onRetry: () => void;
  onOpenWardrobe: () => void;
  onBuyLife: () => void;
  onFreeRefill?: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  sessionCarrots,
  maxCarrots,
  totalCarrots,
  highScore,
  isNewHigh,
  lives,
  onRetry,
  onOpenWardrobe,
  onBuyLife,
  onFreeRefill,
}) => {
  const router = useRouter();
  const carrotBonusPoints = sessionCarrots * 5;
  const totalRunScore = score + carrotBonusPoints;
  const isOutOfLives = lives <= 0;
  const canAffordLife = totalCarrots >= EXTRA_LIFE_CARROT_COST;

  useEffect(() => {
    if (isNewHigh) {
      soundEngine.playFanfare();
      triggerHaptic('fanfare');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } else {
      triggerHaptic('gameover');
    }
  }, [isNewHigh]);

  const refillAction = isOutOfLives
    ? canAffordLife
      ? {
          label: `Refill life (${EXTRA_LIFE_CARROT_COST} carrots)`,
          onClick: () => { soundEngine.playClick(); triggerHaptic('carrot'); onBuyLife(); },
        }
      : {
          label: 'Free refill (+5 lives)',
          onClick: () => {
            soundEngine.playClick();
            triggerHaptic('carrot');
            if (onFreeRefill) onFreeRefill();
            else onBuyLife();
          },
        }
    : undefined;

  return (
    <RunOverDialog
      onClose={() => router.push('/')}
      onPlayAgain={() => { soundEngine.playClick(); triggerHaptic('hop'); onRetry(); }}
      onWardrobe={() => { soundEngine.playClick(); triggerHaptic('tap'); onOpenWardrobe(); }}
      distancePts={score}
      carrotsGathered={sessionCarrots}
      carrotsOf={maxCarrots}
      carrotsPts={carrotBonusPoints}
      totalScore={totalRunScore}
      livesRemaining={lives}
      livesTotal={MAX_DAILY_LIVES}
      highScore={highScore}
      livesToPlayAgain={1}
      outOfLives={isOutOfLives}
      refillAction={refillAction}
    />
  );
};

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenWardrobe: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onOpenWardrobe,
}) => {
  const router = useRouter();
  const titleId = 'dlgPauseTitle';

  return (
    <DialogShell open onClose={onResume} labelledBy={titleId} maxWidth={380} maxHeight={480}>
      <div className="rsDlg" style={{ textAlign: 'center' }}>
        <button className="dlgClose" onClick={onResume} aria-label="Close">
          <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 id={titleId} className="dlgTitle" style={{ marginTop: 6 }}>game paused</h2>
        <p className="rsCopy">take a breather, hopper.</p>

        <div className="rsActions">
          <button
            className="dlgPrimary"
            type="button"
            onClick={() => { soundEngine.playClick(); triggerHaptic('tap'); onResume(); }}
          >
            <span>resume</span>
          </button>
          <button
            className="rsGhostLink"
            type="button"
            onClick={() => { soundEngine.playClick(); triggerHaptic('tap'); onRestart(); }}
          >
            restart run
          </button>
          <button
            className="rsGhostLink"
            type="button"
            onClick={() => { soundEngine.playClick(); triggerHaptic('tap'); onOpenWardrobe(); }}
          >
            bunny wardrobe
          </button>
          <button className="rsGhostLink" type="button" onClick={() => router.push('/')}>
            quit to home
          </button>
        </div>
      </div>
    </DialogShell>
  );
};
