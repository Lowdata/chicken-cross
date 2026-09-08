'use client';

import { useEffect, useMemo, useState } from 'react';
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

type Step = { n: string; t: string; ico: string; c: string };
type KeyRow = { k: string; g: 'arrows' | 'swipe' | 'speed'; b: string };
type Tier = { on: number; of: number; gold: number; span: string; k: string; t: string; c: string };

const STEPS: Step[] = [
  { n: '01', t: 'hop across', ico: '3d/hero-bunny.png',
    c: 'guide your bunny across busy roads and rivers. every hop forward scores. cars hurt.' },
  { n: '02', t: 'collect carrots', ico: '3d/carrot.png',
    c: 'carrots are scattered along the way. five in a run puts you in the reward pool.' },
  { n: '03', t: 'claim rewards', ico: '3d/trophy.png',
    c: 'connect your wallet, finish the tasks, claim what you earned. referrals pay too.' },
];

const KEYS: KeyRow[] = [
  { k: 'desktop', g: 'arrows', b: 'arrow keys or WASD to hop.' },
  { k: 'mobile', g: 'swipe', b: 'swipe or tap to hop.' },
  { k: 'tip', g: 'speed', b: 'the road speeds up every 5 seconds.' },
];

const TIERS: Tier[] = [
  { on: 4, of: 9, gold: 0, span: '1 – 4', k: 'warm', t: 'no reward',
    c: "you're warming up. keep hopping and grab more carrots next run." },
  { on: 8, of: 9, gold: 0, span: '5 – 8', k: 'draw', t: 'reward pool',
    c: 'first come, first served. submit your score early to claim from the pool.' },
  { on: 8, of: 9, gold: 1, span: '9', k: 'win', t: 'guaranteed',
    c: 'the 9th carrot has a 1 in 100 chance. land it and the whitelist is yours.' },
];

const ArrowGlyph = ({ n }: { n: 'up' | 'down' | 'left' | 'right' }) => {
  const d: Record<string, string> = {
    up: 'M12 5v14M12 5l-5 5M12 5l5 5', down: 'M12 19V5M12 19l-5-5M12 19l5-5',
    left: 'M5 12h14M5 12l5-5M5 12l5 5', right: 'M19 12H5M19 12l-5-5M19 12l-5 5',
  };
  return (
    <svg className="kc__g" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d[n]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const GLYPH: Record<KeyRow['g'], React.ReactNode> = {
  arrows: (
    <>
      <kbd className="kc"><ArrowGlyph n="up" /></kbd>
      <kbd className="kc"><ArrowGlyph n="left" /></kbd>
      <kbd className="kc"><ArrowGlyph n="down" /></kbd>
      <kbd className="kc"><ArrowGlyph n="right" /></kbd>
    </>
  ),
  swipe: (
    <span className="kc kc--glyph">
      <svg className="kc__g" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M11 21V10a2.5 2.5 0 0 1 5 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 16.5a2.2 2.2 0 0 1 4.4 0V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20.4 18a2.2 2.2 0 0 1 4.4 0v3.6c0 3.4-2.6 6.4-6.2 6.4h-2.4c-2 0-3.4-.8-4.6-2.4L8 21.6"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ),
  speed: (
    <span className="kc kc--glyph">
      <svg className="kc__g" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="17" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M16 11v6l4 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  ),
};

function CloseIcon(){
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ArrowIcon({ dir }: { dir: 'l' | 'r' }){
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d={dir === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PAGE_KICKERS = ['the run', 'controls', 'rewards'];
const PAGE_TITLES = ['three hops to earning', 'how you move', 'how many carrots you need'];

export default function HowToPlayDialog({ onClose }: { onClose: () => void }){
  const [page, setPage] = useState(0);
  const pages = 3;
  const titleId = 'dlgHowToTitle';
  const narrow = useIsNarrow();
  const go = (n: number) => setPage(Math.max(0, Math.min(pages - 1, n)));

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(page - 1);
    if (e.key === 'ArrowRight') go(page + 1);
  };

  const carrots = useMemo(() => (t: Tier) => Array.from({ length: t.of }, (_, i) => {
    const gold = t.gold && i === t.of - 1;
    const off = !gold && i >= t.on;
    return (
      <img
        key={i}
        className={`htTier__slot${gold ? ' is-gold' : off ? ' is-off' : ''}`}
        src={ASSET + (gold ? '3d/carrot-gold.png' : '3d/carrot.png')}
        alt=""
      />
    );
  }), []);

  return (
    <DialogShell onClose={onClose} labelledBy={titleId} maxWidth={narrow ? 390 : 760} maxHeight={narrow ? 745 : 650}>
      <div className="htDlg" onKeyDown={onKeyNav}>
        <div className="htHead">
          <img className="htHead__ico" src={`${ASSET}deco-carrot.webp`} alt="" aria-hidden="true" />
          <h2 className="htHead__title" id={titleId}>how to play</h2>
          <img className="htHead__ico" src={`${ASSET}deco-carrot.webp`} alt="" aria-hidden="true" />
        </div>
        <p className="htSub">everything you need, in {pages} pages.</p>

        <button className="dlgClose" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <p className="htKicker">{PAGE_KICKERS[page]}</p>
        <h3 className="htTitle">{PAGE_TITLES[page]}</h3>

        <div className="htBody">
          {page === 0 && (
            <>
              <ul className="htSteps">
                {STEPS.map(s => (
                  <li className="htStep" key={s.n}>
                    <span className="htStep__n">{s.n}</span>
                    <span className="htStep__art"><img src={ASSET + s.ico} alt="" /></span>
                    <div className="htStep__body">
                      <p className="htStep__t">{s.t}</p>
                      <p className="htStep__c">{s.c}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="htBanner">
                <img className="htBanner__ico" src={`${ASSET}3d/trophy.png`} alt="" />
                <span className="htBanner__text">
                  <b>every run can pay.</b>
                  <i>you only need five carrots to be in the draw.</i>
                </span>
              </div>
            </>
          )}

          {page === 1 && (
            <>
              <ul className="htKeys">
                {KEYS.map(row => (
                  <li key={row.k}>
                    <span className="htKeys__k">{row.k}</span>
                    <span className="htKeys__g">{GLYPH[row.g]}</span>
                    <b>{row.b}</b>
                  </li>
                ))}
              </ul>
              <div className="htBanner">
                <img className="htBanner__ico" src={`${ASSET}deco-heart.webp`} alt="" />
                <span className="htBanner__text">
                  <b>five lives a day, free.</b>
                  <i>finish a task and you get one more heart on top.</i>
                </span>
              </div>
            </>
          )}

          {page === 2 && (
            <>
              <div className="htMeter">
                {TIERS.map(t => (
                  <div className={`htTier is-${t.k}`} key={t.k}>
                    <div className="htTier__row">{carrots(t)}</div>
                    <div className="htTier__head">
                      <b>{t.t}</b>
                      <i>{t.span}</i>
                    </div>
                    <p className="htTier__c">{t.c}</p>
                  </div>
                ))}
              </div>
              <div className="htBanner">
                <img className="htBanner__ico" src={`${ASSET}3d/carrot-gold.png`} alt="" />
                <span className="htBanner__text">
                  <b>the ninth carrot is the prize.</b>
                  <i>land it and the whitelist is yours, no racing.</i>
                </span>
              </div>
            </>
          )}
        </div>

        <nav className="htNav">
          <button className="htArrow" type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label="previous page">
            <ArrowIcon dir="l" />
          </button>
          <span className="htDots">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`htDot${i === page ? ' is-on' : ''}`}
                aria-label={`page ${i + 1}`}
                aria-current={i === page}
                onClick={() => go(i)}
              />
            ))}
          </span>
          <button className="htArrow" type="button" onClick={() => go(page + 1)} disabled={page === pages - 1} aria-label="next page">
            <ArrowIcon dir="r" />
          </button>
        </nav>

        <button className="dlgPrimary htPrimary" type="button" onClick={onClose}>got it</button>
      </div>
    </DialogShell>
  );
}
