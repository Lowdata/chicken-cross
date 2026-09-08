'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FlipLabel from '@/components/landing/FlipLabel';
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
const FIG = '/pp-figma/';

type Step = { n: string; t: string; ico: string; c: string };
type Tier = { on: number; of: number; gold: number; span: string; k: string; t: string; c: string };

const STEPS: Step[] = [
  { n: '01', t: 'hop across', ico: '3d/hero-bunny.png',
    c: 'guide your bunny across busy roads and rivers. every hop forward scores. cars hurt.' },
  { n: '02', t: 'collect carrots', ico: '3d/carrot.png',
    c: 'carrots are scattered along the way. five in a run puts you in the reward pool.' },
  { n: '03', t: 'claim rewards', ico: '3d/trophy.png',
    c: 'connect your wallet, finish the tasks, claim what you earned. referrals pay too.' },
];

const TIERS: Tier[] = [
  { on: 4, of: 9, gold: 0, span: '1 – 4', k: 'warm', t: 'no reward',
    c: "you're warming up. keep hopping and grab more carrots next run." },
  { on: 8, of: 9, gold: 0, span: '5 – 8', k: 'draw', t: 'reward pool',
    c: 'first come, first served. submit your score early to claim from the pool.' },
  { on: 8, of: 9, gold: 1, span: '9', k: 'win', t: 'guaranteed',
    c: 'the 9th carrot has a 1 in 100 chance. land it and the whitelist is yours.' },
];

function CloseIcon(){
  return <img className="htIcoImg" src={`${FIG}ht-close.svg`} alt="" width={22} height={22} />;
}
function ArrowIcon({ dir }: { dir: 'l' | 'r' }){
  return <img className="htIcoImg" src={`${FIG}${dir === 'l' ? 'ht-arrow-prev' : 'ht-arrow-next'}.svg`} alt="" width={22} height={22} />;
}

const PAGE_KICKERS = ['the run', 'controls', 'rewards'];
const PAGE_TITLES = ['three hops to earning', 'how you move', 'how many carrots you need'];

export default function HowToPlayDialog({ open = true, onClose }: { open?: boolean; onClose: () => void }){
  const [page, setPage] = useState(0);
  const pages = 3;
  const titleId = 'dlgHowToTitle';
  const narrow = useIsNarrow();
  const go = (n: number) => setPage(Math.max(0, Math.min(pages - 1, n)));

  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    const body = bodyRef.current;
    if (!panel || !body) return;
    const nextHeight = panel.scrollHeight;
    panel.style.height = `${panel.getBoundingClientRect().height}px`;
    requestAnimationFrame(() => {
      panel.style.height = `${nextHeight}px`;
    });
    const clear = () => { panel.style.height = ''; };
    panel.addEventListener('transitionend', clear, { once: true });
    return () => panel.removeEventListener('transitionend', clear);
  }, [page, narrow]);

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
    <DialogShell
      ref={panelRef}
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      panelClassName="dlgShell__panel--stack"
      maxWidth={narrow ? 390 : 760}
      maxHeight={narrow ? 858 : 829}
    >
      <div className="htDlg" onKeyDown={onKeyNav}>
        {narrow ? (
          <div className="htHead htHead--narrow">
            <img className="htHead__ico" src={`${ASSET}deco-carrot.webp`} alt="" aria-hidden="true" />
            <h2 className="htHead__title htHead__title--narrow" id={titleId}>how to play</h2>
          </div>
        ) : (
          <div className="htHead">
            <img className="htHead__ico" src={`${ASSET}deco-carrot.webp`} alt="" aria-hidden="true" />
            <h2 className="htHead__title" id={titleId}>how to play</h2>
            <img className="htHead__ico" src={`${ASSET}deco-carrot.webp`} alt="" aria-hidden="true" />
          </div>
        )}
        <p className="htSub">everything you need, in {pages} pages.</p>

        <button className="dlgClose htClose" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <p className="htKicker">{PAGE_KICKERS[page]}</p>
        <h3 className="htTitle">{PAGE_TITLES[page]}</h3>

        <div className="htBody" ref={bodyRef}>
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
                <li className="htKeys__row">
                  <span className="htKeys__k">desktop</span>
                  <span className="htKeys__g">
                    <kbd className="kc">↑</kbd>
                    <kbd className="kc">←</kbd>
                    <kbd className="kc">↓</kbd>
                    <kbd className="kc">→</kbd>
                    <span className="htKeys__or">or</span>
                    <kbd className="kc">W</kbd>
                    <kbd className="kc">A</kbd>
                    <kbd className="kc">S</kbd>
                    <kbd className="kc">D</kbd>
                  </span>
                  <p className="htKeys__c">to hop.</p>
                </li>
                <li className="htKeys__row">
                  <span className="htKeys__k">mobile</span>
                  <span className="htKeys__g">
                    <span className="kc kc--glyph"><img className="kc__img" src={`${FIG}ht-touch.svg`} alt="" /></span>
                    <span className="htKeys__or">or</span>
                    <span className="kc kc--glyph"><img className="kc__img" src={`${FIG}ht-gamepad.svg`} alt="" /></span>
                  </span>
                  <p className="htKeys__c">swipe or tap to hop.</p>
                </li>
                <li className="htKeys__row htKeys__row--tip">
                  <span className="htKeys__k">tip</span>
                  <span className="htKeys__g">
                    <span className="kc kc--glyph"><img className="kc__img" src={`${FIG}ht-clock.svg`} alt="" /></span>
                  </span>
                  <p className="htKeys__c">the road speeds up every 5 seconds.</p>
                </li>
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

        <button className="dlgPrimary htPrimary" type="button" onClick={onClose}><FlipLabel>got it</FlipLabel></button>
      </div>
    </DialogShell>
  );
}
