import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function createScroll({ touch = false } = {}){
  const lenis = new Lenis({

    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,

    syncTouch: touch,
    anchors: { offset: -112 },
    autoResize: true
  });

  const state = { scroll: 0, limit: 1, progress: 0, velocity: 0 };

  lenis.on('scroll', e => {
    state.scroll   = e.scroll;
    state.limit    = Math.max(1, e.limit);
    state.progress = Math.min(1, Math.max(0, e.progress));
    state.velocity = e.velocity;
  });

  return { lenis, state, raf: t => lenis.raf(t) };
}
