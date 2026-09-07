const ASSET = '/pp-game/';
const img = (src, cls) => `<img${cls ? ` class="${cls}"` : ''} src="${src}" alt="" />`;

const STEPS = [
  { n: '01', t: 'hop across', ico: '3d/hero-bunny.png',
    c: 'guide your bunny across busy roads and rivers. every hop forward scores. cars hurt.' },
  { n: '02', t: 'collect carrots', ico: '3d/carrot.png',
    c: 'carrots are scattered along the way. five in a run puts you in the reward pool.' },
  { n: '03', t: 'claim rewards', ico: '3d/trophy.png',
    c: 'connect your wallet, finish the tasks, claim what you earned. referrals pay too.' }
];

const TIERS = [
  { on: 4, of: 9, gold: 0, span: '1 – 4', k: 'warm', t: 'no reward',
    c: "you're warming up. keep hopping and grab more carrots next run." },
  { on: 8, of: 9, gold: 0, span: '5 – 8', k: 'draw', t: 'reward pool',
    c: 'first come, first served. submit your score early to claim from the pool.' },
  { on: 8, of: 9, gold: 1, span: '9', k: 'win', t: 'guaranteed',
    c: 'the 9th carrot has a 1 in 100 chance. land it and the whitelist is yours.' }
];

const key = l => `<kbd class="kc">${l}</kbd>`;
const GLYPH = {
  swipe: `<svg class="kc__g" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M11 21V10a2.5 2.5 0 0 1 5 0v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 16.5a2.2 2.2 0 0 1 4.4 0V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M20.4 18a2.2 2.2 0 0 1 4.4 0v3.6c0 3.4-2.6 6.4-6.2 6.4h-2.4c-2 0-3.4-.8-4.6-2.4L8 21.6"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dpad: `<svg class="kc__g" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M12 4h8v8h8v8h-8v8h-8v-8H4v-8h8V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="16" r="2.2" fill="currentColor"/></svg>`,
  speed: `<svg class="kc__g" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="17" r="10" stroke="currentColor" stroke-width="2"/>
    <path d="M16 11v6l4 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 3h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};
const cap = g => `<span class="kc kc--glyph">${GLYPH[g]}</span>`;

const carrots = t => Array.from({ length: t.of }, (_, i) => {
  const gold = t.gold && i === t.of - 1;
  const off  = !gold && i >= t.on;
  return `<span class="ht-slot${gold ? ' is-gold' : off ? ' is-off' : ''}">
    ${img(ASSET + (gold ? '3d/carrot-gold.png' : '3d/carrot.png'))}</span>`;
}).join('');

const banner = (ico, big, small) => `<div class="ht-banner">
  <span class="ht-banner__ico">${img(ASSET + ico)}</span>
  <span><b>${big}</b><i>${small}</i></span>
</div>`;

const PAGES = [
  { k: 'the run', t: 'three hops to earning', build: () => `
    <ol class="ht-steps">
      ${STEPS.map(s => `<li class="ht-step">
        <span class="ht-step__n">${s.n}</span>
        <span class="ht-step__art">${img(ASSET + s.ico)}</span>
        <span class="ht-step__t">${s.t}</span>
        <p class="ht-step__c">${s.c}</p>
      </li>`).join('')}
    </ol>
    ${banner('3d/trophy.png', 'every run can pay.', 'you only need five carrots to be in the draw.')}` },

  { k: 'controls', t: 'how you move', build: () => `
    <ul class="ht-keys">
      <li><span class="ht-keys__k">desktop</span>
        <span class="ht-keys__g">${key('↑')}${key('←')}${key('↓')}${key('→')}
          <span class="kc__or">or</span>${key('W')}${key('A')}${key('S')}${key('D')}</span>
        <b>to hop.</b></li>
      <li><span class="ht-keys__k">mobile</span>
        <span class="ht-keys__g">${cap('swipe')}<span class="kc__or">or</span>${cap('dpad')}</span>
        <b>swipe or tap to hop.</b></li>
      <li><span class="ht-keys__k">tip</span>
        <span class="ht-keys__g">${cap('speed')}</span>
        <b>the road speeds up every 5 seconds.</b></li>
    </ul>
    ${banner('deco-heart.webp', 'five lives a day, free.', 'finish a task and you get one more heart on top.')}` },

  { k: 'rewards', t: 'how many carrots you need', build: () => `
    <div class="ht-meter">
      ${TIERS.map(t => `<div class="ht-tier is-${t.k}">
        <span class="ht-tier__row">${carrots(t)}</span>
        <span class="ht-tier__head"><b>${t.t}</b><i>${t.span}</i></span>
        <p class="ht-tier__c">${t.c}</p>
      </div>`).join('')}
    </div>
    ${banner('3d/carrot-gold.png', 'the ninth carrot is the prize.', 'land it and the whitelist is yours, no racing.')}` }
];

const CLOSE = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
  <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const ARROW = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
  <path d="${d === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" stroke="currentColor"
        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let lastFocused = null;

export function openHowToPlay(){
  if (document.querySelector('.howto')) return;
  lastFocused = document.activeElement;

  let i = 0;

  const root = document.createElement('div');
  root.className = 'gui howto';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'how to play');
  root.innerHTML = `
    <div class="gui__card howto__card">
      <button class="gui__close" type="button" data-close aria-label="close">${CLOSE}</button>

      <header class="ht-head">
        <span class="ht-head__mark">${img(ASSET + 'deco-carrot.webp')}</span>
        <h2 class="gui__title">how to play</h2>
        <span class="ht-head__mark">${img(ASSET + 'deco-carrot.webp')}</span>
      </header>
      <p class="gui__sub">everything you need, in ${PAGES.length} pages.</p>

      <p class="ht-kicker" data-kicker></p>
      <h3 class="ht-title" data-title></h3>

      <div class="gui__body ht-body" data-page></div>

      <nav class="ht-nav">
        <button class="ht-arrow" type="button" data-prev aria-label="previous page">${ARROW('l')}</button>
        <span class="ht-dots" data-dots></span>
        <button class="ht-arrow" type="button" data-next aria-label="next page">${ARROW('r')}</button>
      </nav>

      <div class="gui__actions">
        <button class="gui__btn --primary" type="button" data-close>got it</button>
      </div>
    </div>`;

  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';

  const page   = root.querySelector('[data-page]');
  const dots   = root.querySelector('[data-dots]');
  const kicker = root.querySelector('[data-kicker]');
  const title  = root.querySelector('[data-title]');
  const prev   = root.querySelector('[data-prev]');
  const next   = root.querySelector('[data-next]');

  function draw(){
    const p = PAGES[i];
    kicker.textContent = p.k;
    title.textContent = p.t;
    page.innerHTML = p.build();
    page.scrollTop = 0;
    dots.innerHTML = PAGES.map((_, n) =>
      `<i class="ht-dot${n === i ? ' is-on' : ''}" data-go="${n}"></i>`).join('');
    prev.disabled = i === 0;
    next.disabled = i === PAGES.length - 1;
  }
  const go = n => { i = Math.max(0, Math.min(PAGES.length - 1, n)); draw(); };

  const close = () => {
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  };
  function onKey(e){
    if (e.key === 'Escape'){ e.preventDefault(); return close(); }
    if (e.key === 'ArrowLeft')  return go(i - 1);
    if (e.key === 'ArrowRight') return go(i + 1);
  }
  document.addEventListener('keydown', onKey);

  root.addEventListener('click', e => {
    if (e.target === root || e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-prev]')) return go(i - 1);
    if (e.target.closest('[data-next]')) return go(i + 1);
    const dot = e.target.closest('[data-go]');
    if (dot) return go(Number(dot.dataset.go));
  });

  draw();
  root.querySelector('.gui__close').focus();
  return { close, go };
}
