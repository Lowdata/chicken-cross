import { createScroll } from './scroll/scroll.js';
import { mountDrift } from './drift.js';
import { mountChrome } from './chrome.js';
import { mountType } from './type.js';
import { mountTouch } from './touch.js';
import { fitToFrame } from './fitToFrame.js';
import { mountReveal } from './reveal.js';
import { warmImages } from './warmImages.js';
import { mountInteractions } from './interactions.js';
import { mountFps } from './fps.js';
import { mountSheen } from './sheen.js';
import { mountLogoMorph } from './logoMorph.js';
import { isFrozen, onFreezeChange } from './freeze.js';

const DEV = process.env.NODE_ENV !== 'production';

export function mountScene({ ui, canvas }){
  if (!ui) return () => {};

  const unfps = mountFps();

  const unfit = fitToFrame(ui);
  const unreveal = mountReveal(ui);
  const unwarm = warmImages(ui);
  const uninteract = mountInteractions(ui);
  const unsheen = mountSheen(ui);
  const unmorph = mountLogoMorph(ui);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  const mountTouchDispose = mountTouch()?.dispose;

  if (reduced) return () => { mountTouchDispose?.(); unfit(); unreveal(); unwarm(); uninteract(); unsheen(); unmorph(); unfps(); };

  const { lenis, state, raf } = createScroll({ touch: false });
  const hooks = [];
  const onFrame = fn => hooks.push(fn);

  let alive = true;
  let handle = 0;
  let pauseOffset = 0;
  let frozenAt = 0;

  function frame(t){
    if (!alive) return;
    const ct = t - pauseOffset;
    raf(ct);
    for (let i = 0; i < hooks.length; i++) hooks[i](ct);
    handle = requestAnimationFrame(frame);
  }

  const onFreeze = next => {
    if (next){
      frozenAt = performance.now();
      cancelAnimationFrame(handle);
      handle = 0;
    } else {
      pauseOffset += performance.now() - frozenAt;
      handle = requestAnimationFrame(frame);
    }
  };
  const offFreeze = onFreezeChange(onFreeze);
  if (isFrozen()) onFreeze(true);
  else handle = requestAnimationFrame(frame);

  const drift = mountDrift({ onFrame, state });
  const chrome = mountChrome({ onFrame, state });
  const type = mountType({ onFrame, state });

  let stage = null;
  let disposed = false;
  const wantsScene = !coarse && innerWidth >= 900;
  if (wantsScene) import('./stage.js').then(({ mountStage }) => {
    if (disposed) return;
    stage = mountStage({ canvas, ui, state, onFrame });
    if (DEV) window.__pp = { stage, drift, chrome, type, state, lenis, coarse };
  });

  return function dispose(){
    disposed = true;
    unfit();
    unreveal();
    unwarm();
    uninteract();
    unsheen();
    unmorph();
    mountTouchDispose?.();
    alive = false;
    offFreeze();
    cancelAnimationFrame(handle);
    hooks.length = 0;
    lenis.destroy();
    stage?.dispose?.();
    drift?.dispose?.();
    chrome?.dispose?.();
    type?.dispose?.();
    unfps();
    if (DEV) delete window.__pp;
  };
}
