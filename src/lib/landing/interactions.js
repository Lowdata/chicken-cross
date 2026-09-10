import { initHoloSky } from './holo-sky.js';
import { scrollTo } from './scroll/scroll.js';

function mountWarrenStrip(root){
  const strip = root.querySelector('#wrStrip');
  if (!strip) return null;

  const set = () => { if (matchMedia('(max-width:1099px)').matches) strip.scrollLeft = 481.2; };
  set();
  const frame = requestAnimationFrame(set);
  addEventListener('load', set);
  addEventListener('resize', set, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    removeEventListener('load', set);
    removeEventListener('resize', set, { passive: true });
  };
}

function mountToast(root){
  const toastEl = root.querySelector('#toast');
  if (!toastEl) return null;
  const inner = toastEl.querySelector('.in');

  let timer;
  function toast(msg){
    inner.innerHTML = msg;
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(timer);
    timer = setTimeout(() => { toastEl.style.transform = 'translateX(-50%) translateY(420%)'; }, 3000);
  }

  const onClick = e => {
    const t = e.target.closest('[data-toast]');
    if (t) toast(t.dataset.toast);

    const g = e.target.closest('[data-go]');
    if (g){
      const target = document.querySelector(g.dataset.go);
      if (target){
        const nav = document.querySelector('.nav')?.getBoundingClientRect().height || 0;
        scrollTo(target, { offset: -nav - 12 });
      }
    }

    const anchor = e.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute('href') !== '#'){
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target){
        e.preventDefault();
        const nav = document.querySelector('.nav')?.getBoundingClientRect().height || 0;
        scrollTo(target, { offset: -nav - 12 });
      }
    }
  };
  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    clearTimeout(timer);
    toastEl.style.removeProperty('transform');
  };
}

function mountDrop(root){
  const zoneFar  = root.querySelector('#drop .fall--far');
  const zoneNear = root.querySelector('#drop .fall--near');
  const section  = root.querySelector('#drop');
  if (!zoneFar || !zoneNear || !section) return null;

  const pieces = ['/pp-art/bun-fly.webp', '/pp-art/bun-sit.webp', '/pp-art/bun-jump.webp',
                  '/pp-art/bun-orbit.webp', '/pp-art/star.webp', '/pp-art/deco-bubble.webp'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DEPTHS = [
    { cls: '--far', size: 56,  dur: 22,   sway: 12, opacity: .34, zone: 'far'  },
    { cls: '--mid', size: 96,  dur: 15,   sway: 24, opacity: .58, zone: 'far'  },
    { cls: '--near', size: 142, dur: 9.5, sway: 30, opacity: .92, zone: 'near' }
  ];

  const LANES = [42, 46, 48, 50, 50, 52, 54, 58, 30, 68, 22, 78];
  let laneIx = 0;
  const nextLane = () => LANES[(laneIx++) % LANES.length] + (Math.random() * 3 - 1.5);

  if (reduced){

    const STILL = [
      { z: 'far',  cls: '--far', size: 56,  x: 24, y: 14, op: .32 },
      { z: 'far',  cls: '--mid', size: 92,  x: 66, y: 30, op: .5  },
      { z: 'far',  cls: '--far', size: 52,  x: 78, y: 10, op: .3  },
      { z: 'near', cls: '--near', size: 130, x: 47, y: 64, op: .85 },
      { z: 'near', cls: '--near', size: 96,  x: 32, y: 78, op: .7  },
      { z: 'far',  cls: '--mid', size: 88,  x: 20, y: 58, op: .46 }
    ];
    const added = STILL.map((s, i) => {
      const el = document.createElement('img');
      el.src = pieces[i % pieces.length];
      el.className = 'fall__p ' + s.cls + ' fall__p--still';
      el.style.cssText = `left:${s.x}%;top:${s.y}%;width:${s.size}px;opacity:${s.op}`;
      (s.z === 'near' ? zoneNear : zoneFar).appendChild(el);
      return el;
    });
    return () => { for (const el of added) el.remove(); };
  }

  const near = () => {
    const r = section.getBoundingClientRect();
    return r.top < innerHeight * 1.15 && r.bottom > -innerHeight * 0.15;
  };

  const live = new Set();
  const spawn = (prefill) => {
    const d = DEPTHS[Math.floor(Math.random() * DEPTHS.length)];
    const zone = d.zone === 'near' ? zoneNear : zoneFar;
    const x = nextLane();
    const el = document.createElement('img');
    el.src = pieces[Math.floor(Math.random() * pieces.length)];
    el.className = 'fall__p ' + d.cls;
    const delay = prefill ? `-${(Math.random() * d.dur).toFixed(2)}s` : '0s';
    el.style.cssText =
      `left:${x.toFixed(1)}%;width:${d.size}px;--sway:${d.sway}px;` +
      `animation-duration:${d.dur}s;animation-delay:${delay};opacity:${d.opacity}`;
    zone.appendChild(el);
    const entry = { el, to: 0 };
    entry.to = setTimeout(() => { el.remove(); live.delete(entry); }, d.dur * 1000 + 400);
    live.add(entry);
  };

  for (let i = 0; i < 10; i++) spawn(true);

  const shown = () => getComputedStyle(zoneNear).display !== 'none';
  let timer = null;
  const tick = () => {
    if (!shown() || !near() || (zoneFar.childElementCount + zoneNear.childElementCount) > 20) return;
    spawn(false);
  };
  const io = new IntersectionObserver(es => {
    const on = es.some(e => e.isIntersecting) && shown();
    if (on && !timer) timer = setInterval(tick, 700);
    if (!on && timer){ clearInterval(timer); timer = null; }
  }, { rootMargin: '15% 0px' });
  io.observe(section);

  return () => {
    io.disconnect();
    if (timer) clearInterval(timer);
    for (const entry of live){ clearTimeout(entry.to); entry.el.remove(); }
    live.clear();
  };
}

function mountBounce(root){
  const btn = root.querySelector('#bounceBtn, #signal .sg__bounce');

  const coins = root.querySelectorAll('#signal [data-shine="coin"]');
  if (!btn || !coins.length) return null;

  const hop = () => {
    for (const coin of coins){
      coin.classList.remove('is-bounce');
      void coin.offsetWidth;
      coin.classList.add('is-bounce');
    }
  };
  btn.addEventListener('click', hop);

  const onPoke = e => { e.preventDefault(); hop(); };
  for (const coin of coins) coin.addEventListener('pp:poke', onPoke);

  return () => {
    btn.removeEventListener('click', hop);
    for (const coin of coins){
      coin.removeEventListener('pp:poke', onPoke);
      coin.classList.remove('is-bounce');
    }
  };
}

function mountDropSky(root){
  const c = root.querySelector('#drop .drop__sky');
  const section = root.querySelector('#drop');
  if (!c || !section) return null;

  let teardown = null;
  const io = new IntersectionObserver(entries => {
    for (const e of entries){
      if (!e.isIntersecting || teardown) continue;
      if (getComputedStyle(c).display === 'none') continue;
      teardown = initHoloSky(c);
      io.unobserve(section);
    }
  }, { rootMargin: '40% 0px' });
  io.observe(section);

  return () => {
    io.disconnect();
    teardown?.();
    teardown = null;
  };
}

function mountPlay(root){
  const buttons = [...root.querySelectorAll('#ctaPlay, .bhx__play')];
  if (!buttons.length) return null;

  const onClick = e => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('pp:play'));
  };
  for (const b of buttons) b.addEventListener('click', onClick);

  return () => { for (const b of buttons) b.removeEventListener('click', onClick); };
}

function mountBhxHow(root){
  const btn = root.querySelector('#bhxHow');
  if (!btn) return null;

  let open = null;
  const onClick = async () => {
    const { openHowToPlay } = await import('./howto.js');
    open = openHowToPlay() || open;
  };
  btn.addEventListener('click', onClick);

  return () => {
    btn.removeEventListener('click', onClick);
    open?.close?.();
    open = null;
  };
}

export function mountInteractions(ui){
  const root = ui || document.getElementById('ui');
  if (!root) return () => {};

  const disposers = [
    mountWarrenStrip(root),
    mountToast(root),
    mountDrop(root),
    mountDropSky(root),
    mountPlay(root),
    mountBhxHow(root),
    mountBounce(root)
  ].filter(Boolean);

  return () => { for (const dispose of disposers) dispose(); };
}
