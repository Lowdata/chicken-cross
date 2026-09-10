const TAU = Math.PI * 2;

export const ASSETS = [

  { hook: 'top/lockup',  ax: 4, ay: 6, p: 17.3, roll: 0.4, depth: 0.15, phase: 0.0, centred: true,
    enter: { dy: 22, rot: 0,   dur: 800, delay: 0,   fade: true } },
  { hook: 'top/ring',    ax: 4, ay: 6, p: 21.7, roll: 0.5, depth: 0.10, phase: 0.7,
    enter: { dy: 0,  rot: -22, dur: 900, delay: 120, fade: false } },
  { hook: 'top/hangul',  ax: 2, ay: 4, p: 13.7, roll: 0.6, depth: 0.25, phase: 0.4 },
  { hook: 'top/planet',  ax: 5, ay: 7, p: 15.7, roll: 1.2, depth: 0.45, phase: 0.2 },
  { hook: 'top/star',    ax: 6, ay: 5, p: 11.3, roll: 1.6, depth: 0.60, phase: 0.8 },

  { hook: 'top/lockup-m', ax: 3, ay: 5, p: 17.3, roll: 0.35, depth: 0.15, phase: 0.0, centred: true,
    enter: { dy: 22, rot: 0,   dur: 800, delay: 0,   fade: true } },

  { hook: 'top/ring-m',   ax: 2, ay: 3.5, p: 17.3, roll: 0.25, depth: 0.15, phase: 0.0, centred: true,
    enter: { dy: 0,  rot: -22, dur: 900, delay: 120, fade: false } },
  { hook: 'top/hangul-m', ax: 2, ay: 4, p: 13.7, roll: 0.6, depth: 0.25, phase: 0.4 },
  { hook: 'top/planet-m', ax: 5, ay: 7, p: 15.7, roll: 1.2, depth: 0.45, phase: 0.2 },
  { hook: 'top/star-m',   ax: 6, ay: 5, p: 11.3, roll: 1.6, depth: 0.60, phase: 0.8 },

  { hook: 'bunnyhop/spark',       ax: 7, ay: 9, p: 9.7,  roll: 3,   depth: 0.70, phase: 0.1 },
  { hook: 'bunnyhop/orb',         ax: 5, ay: 6, p: 8.9,  roll: 2,   depth: 0.65, phase: 0.5 },
  { hook: 'bunnyhop/carrot',      ax: 4, ay: 6, p: 10.7, roll: 2.5, depth: 0.55, phase: 0.6 },
  { hook: 'bunnyhop/ring',        ax: 3, ay: 5, p: 17.3, roll: 0.4, depth: 0.20, phase: 0.3 },
  { hook: 'bunnyhop/orbit-bunny', ax: 3, ay: 6, p: 18.1, roll: 0.4, depth: 0.25, phase: 0.9 },
  { hook: 'bunnyhop/bunny',       ax: 0, ay: 2, p: 14.9, roll: 0,   depth: 0.30, phase: 0.0, hop: true },
  { hook: 'bunnyhop/cloud-b',     ax: 6, ay: 3, p: 23.3, roll: 0,   depth: 0.12, phase: 0.2 },
  { hook: 'bunnyhop/cloud-c',     ax: 5, ay: 3, p: 25.1, roll: 0,   depth: 0.10, phase: 0.7 },

  { hook: 'warren/hero-bunny',   ax: 0, ay: 5, p: 16.3, roll: 0.5, depth: 0.30, phase: 0.2 },
  { hook: 'warren/star-a',       ax: 5, ay: 5, p: 8.9,  roll: 3,   depth: 0.65, phase: 0.3 },
  { hook: 'warren/star-b',       ax: 5, ay: 6, p: 12.1, roll: 2.5, depth: 0.60, phase: 0.8 },
  { hook: 'warren/orbit-bunny',  ax: 3, ay: 6, p: 18.1, roll: 0.4, depth: 0.25, phase: 0.6 },

  { hook: 'physical/star',       ax: 5, ay: 6, p: 10.7, roll: 2.5, depth: 0.60, phase: 0.5 },

  { hook: 'lab/ring',            ax: 3, ay: 5, p: 23.3, roll: 0.3, depth: 0.10, phase: 0.4 },
  { hook: 'lab/ring-m',          ax: 3, ay: 5, p: 21.7, roll: 0.3, depth: 0.10, phase: 0.9 },
  { hook: 'lab/star',            ax: 5, ay: 5, p: 7.3,  roll: 3,   depth: 0.70, phase: 0.8 },
  { hook: 'lab/stk-carrot',      ax: 4, ay: 6, p: 13.1, roll: 2.5, depth: 0.55, phase: 0.7 },
  { hook: 'lab/stk-galaxy',      ax: 3, ay: 5, p: 15.7, roll: 1.5, depth: 0.35, phase: 0.1 },
  { hook: 'lab/stk-carrot-m',    ax: 4, ay: 6, p: 11.3, roll: 2.5, depth: 0.55, phase: 0.2 },
  { hook: 'lab/stk-galaxy-m',    ax: 3, ay: 5, p: 14.9, roll: 1.5, depth: 0.35, phase: 0.6 },

  { hook: 'signal/coin',         ax: 2, ay: 5, p: 19.1, roll: 0.5, depth: 0.15, phase: 0.5 },
  { hook: 'signal/coin-m',       ax: 2, ay: 5, p: 19.9, roll: 0.5, depth: 0.15, phase: 0.0 },
  { hook: 'signal/boombox',      ax: 4, ay: 5, p: 12.1, roll: 1.8, depth: 0.50, phase: 0.6 },
  { hook: 'signal/boombox-m',    ax: 4, ay: 5, p: 13.7, roll: 1.8, depth: 0.50, phase: 0.1 },

  { hook: 'intel/star',          ax: 5, ay: 6, p: 9.7,  roll: 2.5, depth: 0.60, phase: 0.6 },

];

const LEAN = 0.35, LEAN_MAX = 8;

function hop(u){
  const c = u % 2.8;
  let y = 0, sx = 1, sy = 1;
  if (c < 0.16){ const k = c / 0.16; sy = 1 - 0.10 * Math.sin(k * Math.PI); sx = 1 + 0.06 * Math.sin(k * Math.PI); }
  else if (c < 0.76){ const k = (c - 0.16) / 0.6; y = -46 * Math.sin(k * Math.PI); const st = Math.sin(k * Math.PI);
    sy = 1 + 0.07 * st * (1 - k); sx = 1 - 0.04 * st * (1 - k); }
  else if (c < 0.94){ const k = (c - 0.76) / 0.18; sy = 1 - 0.12 * Math.sin(k * Math.PI); sx = 1 + 0.08 * Math.sin(k * Math.PI); }
  else if (c < 1.2){ const k = (c - 0.94) / 0.26; sy = 1 + 0.025 * Math.sin(k * Math.PI); }
  return { y, sx, sy };
}
const PARALLAX = 0.06;

const isScrollLinked = () =>
  typeof matchMedia === 'function' && !matchMedia('(pointer: coarse)').matches;

const AMP = 2.2, ROLL = 1.6;

const POKEABLE = new Map([
  ['coin', 'hop'], ['coin-m', 'hop'],
  ['bunny', 'hop'], ['orbit-bunny', 'hop'],
  ['hero-bunny', 'drift'],
]);
const POKE_LEN = 1.25;

function nudge(u){
  const k = Math.min(1, u / 1.1);
  const swing = Math.sin(k * Math.PI * 1.5) * Math.exp(-2.6 * k);
  return { y: -26 * swing, r: 5.5 * swing };
}
const easeOut = x => 1 - Math.pow(1 - x, 3);

export function mountDrift({ onFrame, state, root = document }){
  const items = new Map();
  let missing = [];
  let enterAt = 0;
  let disposed = false;

  const io = new IntersectionObserver(entries => {
    for (const e of entries){
      const it = items.get(e.target);
      if (!it) continue;
      const wasActive = it.active;
      it.active = e.isIntersecting;

      if (it.active && !it.el.style.willChange) it.el.style.willChange = 'transform';

      if (it.active && !wasActive) it.leanFrom = performance.now() + 300;
    }
  }, { rootMargin: '15% 0px' });

  const px = v => parseFloat(v) || 0;
  const scrollLinked = isScrollLinked();
  const pointer = { x: -1e4, y: -1e4 };
  const onPointerMove = e => { pointer.x = e.clientX; pointer.y = e.clientY; };
  const onPointerLeave = () => { pointer.x = pointer.y = -1e4; };
  addEventListener('pointermove', onPointerMove, { passive:true });
  addEventListener('pointerleave', onPointerLeave, { passive:true });
  const measure = it => {
    const r = it.el.getBoundingClientRect();
    it.cx = r.left + r.width / 2; it.cy = r.top + r.height / 2 + scrollY;
    it.hero = !!it.el.closest('#top');
  };
  const readBase = it => {
    it.el.removeAttribute('data-drifting');
    const cs = getComputedStyle(it.el);
    const tr = cs.translate, ro = cs.rotate;
    it.bx = 0; it.by = 0; it.br = 0;
    if (tr && tr !== 'none'){ const [x, y] = tr.split(' '); it.bx = px(x); it.by = px(y); }
    if (ro && ro !== 'none') it.br = px(ro);
    it.ownsBase = it.bx || it.by || it.br;
    it.el.setAttribute('data-drifting', '');
    measure(it);
  };

  const alphaMaps = new WeakMap();
  const N = 64;
  const opaqueAt = (el, u, v) => {
    let m = alphaMaps.get(el);
    if (m === undefined){
      m = null;
      try {
        if (el.tagName === 'IMG' && el.complete && el.naturalWidth){
          const c = document.createElement('canvas');
          c.width = c.height = N;
          const g = c.getContext('2d', { willReadFrequently: true });
          g.drawImage(el, 0, 0, N, N);
          const d = g.getImageData(0, 0, N, N).data;

          for (let i = 3; i < d.length; i += 4) if (d[i] > 24){ m = d; break; }

        }
      } catch { m = null; }
      if (m) alphaMaps.set(el, m);
    }
    if (!m) return true;
    const x = Math.min(N - 1, Math.max(0, Math.floor(u * N)));
    const y = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    return m[(y * N + x) * 4 + 3] > 24;
  };

  function resolve(){
    const seen = new Set(); missing = [];
    for (const a of ASSETS){
      const sel = a.hook ? `#${a.hook.split('/')[0]} [data-drift="${a.hook.split('/')[1]}"]` : a.sel;
      const el = a.nth == null ? root.querySelector(sel) : root.querySelectorAll(sel)[a.nth];
      if (!el){ missing.push(a.hook || a.sel); continue; }
      seen.add(el);
      if (items.has(el)) continue;
      el.setAttribute('data-drifting', '');
      const it = { ...a, el, active: false, bx: 0, by: 0, br: 0, mirror: null };
      readBase(it);
      if (POKEABLE.has(el.dataset.drift)){
        it.poke = 0; it.pokeKind = POKEABLE.get(el.dataset.drift);
        el.setAttribute('data-poke', '');

        const warm = () => opaqueAt(el, .5, .5);
        if (el.complete) warm(); else el.addEventListener('load', warm, { once:true });
      }
      items.set(el, it);
      io.observe(el);
    }
    for (const it of items.values()) it.mirror = it.hook ? root.querySelector(`#${it.hook.split('/')[0]} [data-drift-mirror="${it.hook.split('/')[1]}"]`) : null;
    for (const [el, it] of items){
      if (!seen.has(el)){ io.unobserve(el); items.delete(el); el.removeAttribute('data-drifting'); }
    }

    const unlisted = [...root.querySelectorAll('[data-drift]')].filter(el => !items.has(el))
      .map(el => (el.closest('section')?.id || '?') + '/' + el.dataset.drift);
    const owned = [...items.values()].filter(i => i.ownsBase).map(i => i.hook || i.sel);

    if (process.env.NODE_ENV !== 'production'){
      // unlisted hooks run with default passive motion
    }
  }

  resolve();
  const ui = root.getElementById ? root.getElementById('ui') : root;
  let pending = 0;
  const uiMo = ui ? new MutationObserver(() => {
    if (pending) return;
    pending = setTimeout(() => { pending = 0; resolve(); rebase(); }, 120);
  }) : null;
  uiMo?.observe(ui, { childList: true, subtree: true });

  const rebase = () => { for (const it of items.values()) readBase(it); };
  const onResize = () => { for (const it of items.values()) readBase(it); };
  addEventListener('resize', onResize, { passive:true });

  const hook = root.querySelector('#top [data-drift="lockup"]');
  const lockup = hook?.tagName === 'IMG' ? hook : hook?.querySelector('img') || null;
  const go = () => { enterAt = performance.now(); };
  if (lockup && lockup.complete) go();
  else if (lockup) lockup.addEventListener('load', go, { once:true });
  else go();

  const hitTest = (cx, cy, cool) => {
    const now = performance.now();
    for (const it of items.values()){
      if (!it.pokeKind || !it.active) continue;

      if (now - (it.pokedAt || 0) < cool) continue;
      const r = it.el.getBoundingClientRect();
      if (!r.width) continue;
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom
          && opaqueAt(it.el, (cx - r.left) / r.width, (cy - r.top) / r.height)){

        it.pokedAt = now;
        const claimed = !it.el.dispatchEvent(
          new CustomEvent('pp:poke', { bubbles: true, cancelable: true }));
        if (!claimed) it.poke = 'pending';
        return true;
      }
    }
    return false;
  };
  let hitPending = false;
  const onMove = e => {
    if (hitPending) return;
    hitPending = true;
    requestAnimationFrame(() => { hitPending = false; hitTest(e.clientX, e.clientY, POKE_LEN * 1000); });
  };
  const onTap = e => hitTest(e.clientX, e.clientY, 260);
  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('click', onTap, { passive: true });

  let t0 = 0;
  onFrame(t => {
    if (disposed) return;
    if (!t0) t0 = t;
    const s = (t - t0) * 0.001;

    const wake = Math.min(1, (t - t0) / 2500); const ramp = wake * wake * (3 - 2 * wake);
    const leanNow = scrollLinked ? Math.max(-LEAN_MAX, Math.min(LEAN_MAX, -state.velocity * LEAN)) : 0;
    const vc = state.scroll + innerHeight * 0.5;
    const py = pointer.y + state.scroll;
    for (const it of items.values()){
      if (!it.active) continue;

      const w = TAU * (s / it.p + it.phase), w0 = TAU * it.phase;
      const off = it.centred ? 0 : 1;
      let x = it.ax * (Math.sin(w) - off * Math.sin(w0));
      let y = it.ay * (Math.sin(w * 0.5 + 1.3) - off * Math.sin(w0 * 0.5 + 1.3)) + (it.leanFrom && t < it.leanFrom ? 0 : leanNow) * it.depth;
      let rot = it.roll ? it.roll * (Math.sin(w * 0.73 + 0.4) - off * Math.sin(w0 * 0.73 + 0.4)) : 0;
      let ox = 0, oy = 0;
      if (!it.hero){
        if (scrollLinked) oy += (it.cy - vc) * PARALLAX * it.depth;

      }
      if (it.enter && !it.entered){
        const e = it.enter;
        const k = enterAt ? Math.min(1, Math.max(0, (t - enterAt - e.delay) / e.dur)) : 0;
        const q = 1 - easeOut(k);
        y += e.dy * q; rot += e.rot * q;
        if (e.fade) it.el.style.opacity = (1 - q).toFixed(3);
        if (k >= 1){ it.entered = true; if (e.fade) it.el.style.opacity = ''; }
      }
      const st = it.el.style;

      if (it.poke === 'pending') it.poke = t;
      if (it.poke){
        const u = (t - it.poke) / 1000;
        if (u >= POKE_LEN) it.poke = 0;
        else if (it.pokeKind === 'drift'){
          const q = nudge(u);
          y += q.y / AMP;
          rot += q.r / ROLL;
        } else {
          const h = hop(u);
          y += h.y / AMP;
          st.setProperty('--sx', h.sx.toFixed(3));
          st.setProperty('--sy', h.sy.toFixed(3));
        }
      }
      if (it.hop){
        const h = hop(s);
        y += h.y / AMP;
        st.setProperty('--sx', h.sx.toFixed(3)); st.setProperty('--sy', h.sy.toFixed(3));
      }
      st.setProperty('--dx', (x * AMP * ramp + ox + it.bx).toFixed(2) + 'px');
      st.setProperty('--dy', (y * AMP * ramp + oy + it.by).toFixed(2) + 'px');
      st.setProperty('--dr', (rot * ROLL * ramp + it.br).toFixed(2) + 'deg');
      if (it.mirror){ const m = it.mirror.style; m.setProperty('--dx', st.getPropertyValue('--dx')); m.setProperty('--dy', st.getPropertyValue('--dy')); m.setProperty('--dr', st.getPropertyValue('--dr')); }
    }
  });

  function dispose(){
    if (disposed) return;
    disposed = true;
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('click', onTap);
    for (const it of items.values()) it.el.removeAttribute('data-poke');
    io.disconnect();
    uiMo?.disconnect();
    clearTimeout(pending); pending = 0;
    removeEventListener('pointermove', onPointerMove, { passive:true });
    removeEventListener('pointerleave', onPointerLeave, { passive:true });
    removeEventListener('resize', onResize, { passive:true });
    if (lockup) lockup.removeEventListener('load', go, { once:true });
    for (const [el, it] of items){
      el.removeAttribute('data-drifting');
      const st = el.style;
      st.willChange = '';
      st.removeProperty('--dx'); st.removeProperty('--dy'); st.removeProperty('--dr');
      st.removeProperty('--sx'); st.removeProperty('--sy');
      st.opacity = '';
      if (it.mirror){
        const m = it.mirror.style;
        m.removeProperty('--dx'); m.removeProperty('--dy'); m.removeProperty('--dr');
      }
    }
    items.clear();
  }

  return { items, missing: () => missing.slice(), resolve, dispose };
}
