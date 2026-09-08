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

export type RunOverProps = {
  open?: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onWardrobe?: () => void;
  distancePts: number;
  carrotsGathered: number;
  carrotsOf: number;
  carrotsPts: number;
  totalScore: number;
  livesRemaining: number;
  livesTotal: number;
  highScore: number;
  livesToPlayAgain: number;
  wardrobePrice?: number;
};

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function RewindIcon(){
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 2v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RunOverDialog({
  open = true, onClose, onPlayAgain, onWardrobe, distancePts, carrotsGathered, carrotsOf, carrotsPts,
  totalScore, livesRemaining, livesTotal, highScore, livesToPlayAgain, wardrobePrice,
}: RunOverProps){
  const titleId = 'dlgRunOverTitle';
  const inTier = carrotsGathered >= 5;
  const narrow = useIsNarrow();

  return (
    <DialogShell open={open} onClose={onClose} labelledBy={titleId} maxWidth={narrow ? 390 : 420} maxHeight={582}>
      <div className="rsDlg">
        <h2 className="roTitle" id={titleId}>oof, squished.</h2>
        <p className="roLede">here is your run harvest breakdown.</p>

        <button className="dlgClose" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <ul className="roList">
          <li>
            <img className="roList__ico" src={`${ASSET}deco-orb.png`} alt="" />
            <span className="roList__label">distance reached</span>
            <span className="roList__val">{distancePts} pts</span>
          </li>
          <li>
            <img className="roList__ico" src={`${ASSET}3d/carrot.png`} alt="" />
            <span>
              <span className="roList__label">carrots gathered</span>
              <span className="roList__sub">({carrotsGathered}/{carrotsOf})</span>
            </span>
            <span className="roList__val is-bonus">+{carrotsPts} pts</span>
          </li>
        </ul>

        <div className="roNote">
          <img className="roNote__ico" src={`${ASSET}3d/carrot.png`} alt="" />
          <span>
            <b>{inTier ? '5 or more carrots: reward tier' : '1 to 4 carrots: no reward tier'}</b>
            <i>{inTier ? 'nice hop. your run is in the reward pool.' : 'collect 5 or more carrots in a run to earn rewards.'}</i>
          </span>
        </div>

        <div className="roScore">
          <span className="roScore__label">total run score</span>
          <span className="roScore__val">{totalScore}</span>
        </div>

        <ul className="roList">
          <li>
            <img className="roList__ico" src={`${ASSET}ico-heart.png`} alt="" />
            <span className="roList__label">daily lives</span>
            <span className="roList__val">{livesRemaining}/{livesTotal}</span>
          </li>
          <li>
            <img className="roList__ico" src={`${ASSET}deco-star.png`} alt="" />
            <span className="roList__label">high score</span>
            <span className="roList__val">{highScore}</span>
          </li>
        </ul>

        <div className="roActions">
          <button className="dlgPrimary" type="button" onClick={onPlayAgain}>
            <RewindIcon />
            <span style={{ margin: '0 6px' }}>hop again</span>
            <span>{livesToPlayAgain}</span>
            <img src={`${ASSET}ico-heart.png`} alt="" style={{ width: 20, height: 20, marginLeft: 4 }} />
          </button>
          {onWardrobe && (
            <button className="roSecondary" type="button" onClick={onWardrobe}>
              <span>bunny wardrobe</span>
              {typeof wardrobePrice === 'number' && (
                <>
                  <span style={{ marginLeft: 4 }}>{wardrobePrice}</span>
                  <img src={`${ASSET}3d/carrot.png`} alt="" style={{ width: 20, height: 20, marginLeft: 4 }} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </DialogShell>
  );
}

export function useRunOverDialog(){
  const [open, setOpen] = useState(false);
  return { open, openDialog: () => setOpen(true), closeDialog: () => setOpen(false) };
}
