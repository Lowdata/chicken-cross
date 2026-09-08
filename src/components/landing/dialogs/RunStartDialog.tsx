'use client';

import { useEffect, useState } from 'react';
import DialogShell from './DialogShell';

function useIsNarrow(){
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return narrow;
}

const ASSET = '/pp-game/';

export type RunStartProps = {
  open?: boolean;
  onClose: () => void;
  onPlay: () => void;
  onHowToPlay?: () => void;
  livesRemaining: number;
  livesTotal: number;
  livesResetIn?: string;
  bunnySkin: string;
  bunnySkinIcon?: string;
  highScore: number;
};

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PlayIcon(){
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5-9-5.5z" fill="currentColor" />
    </svg>
  );
}

export default function RunStartDialog({
  open = true, onClose, onPlay, onHowToPlay, livesRemaining, livesTotal, livesResetIn, bunnySkin, bunnySkinIcon, highScore,
}: RunStartProps){
  const titleId = 'dlgRunStartTitle';
  const narrow = useIsNarrow();

  return (
    <DialogShell open={open} onClose={onClose} labelledBy={titleId} maxWidth={narrow ? 390 : 420} maxHeight={narrow ? 640 : 656}>
      <div className="rsDlg">
        <img className="rsLogo" src={`${ASSET}hero-lockup.webp`} alt="Bunny Hop" />
        <p className="rsLede" id={titleId}>one life per run.</p>

        <button className="dlgClose" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="rsArt">
          <img src={`${ASSET}3d/hero-bunny.png`} alt="" />
        </div>
        <p className="rsCopy">hop across busy highways and log-filled rivers, harvesting carrots along the way.</p>

        <ul className="rsList">
          <li>
            <img className="rsList__ico" src={`${ASSET}ico-heart.png`} alt="" />
            <span>
              <span className="rsList__label">daily lives</span>
              <span className="rsList__sub">{livesRemaining}/{livesTotal} remaining today</span>
            </span>
            {livesResetIn && <span className="rsList__val is-timer">{livesResetIn}</span>}
          </li>
          <li>
            <img className="rsList__ico" src={bunnySkinIcon ?? `${ASSET}3d/hero-bunny.png`} alt="" />
            <span className="rsList__label">{bunnySkin}</span>
            <span className="rsList__val">{highScore}</span>
          </li>
        </ul>

        <div className="rsActions">
          <button className="dlgPrimary" type="button" onClick={onPlay}>
            <PlayIcon />
            <span style={{ marginLeft: 9 }}>hop in and play</span>
          </button>
          <p className="rsHint">WASD · arrows · swipe</p>
          {onHowToPlay && (
            <button className="rsGhostLink" type="button" onClick={onHowToPlay}>how to play</button>
          )}
        </div>
      </div>
    </DialogShell>
  );
}

export function useRunStartDialog(){
  const [open, setOpen] = useState(false);
  return { open, openDialog: () => setOpen(true), closeDialog: () => setOpen(false) };
}
