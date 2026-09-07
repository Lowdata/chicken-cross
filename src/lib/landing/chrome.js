export function mountChrome({ onFrame, state, root = document }){
  let disposed = false;

  const nav = root.querySelector('.nav');
  let away = false, byVelocity = false;
  const SHOW_ABOVE = 120;

  const under = new Set();
  let headIO = null;
  function watchHeadings(){
    headIO?.disconnect(); under.clear();
    const h = nav ? nav.offsetHeight : 0;
    if (!h) return;
    headIO = new IntersectionObserver(entries => {
      for (const e of entries) e.isIntersecting ? under.add(e.target) : under.delete(e.target);
    }, { rootMargin: `0px 0px ${-(innerHeight - h)}px 0px`, threshold: 0 });
    for (const el of root.querySelectorAll('section h1, section h2')) headIO.observe(el);
  }
  watchHeadings();
  addEventListener('resize', watchHeadings, { passive:true });

  onFrame(() => {
    if (disposed) return;
    if (!nav) return;
    const v = state.velocity;
    if (state.scroll < SHOW_ABOVE || v < -1.5) byVelocity = false;
    else if (v > 2.5) byVelocity = true;

    const next = state.scroll >= SHOW_ABOVE && byVelocity;
    if (next !== away){ away = next; nav.classList.toggle('nav--away', away); }
  });

  const SPEEDS = [71, -113, 89, -101, 79, -97];
  let bands = [];
  const originals = new WeakMap();
  const addedNodes = new WeakMap();
  const origAnimation = new WeakMap();
  const touchedRuns = new Set();
  function fill(run){
    if (!originals.has(run)) originals.set(run, [...run.childNodes].map(n => n.cloneNode(true)));
    if (!addedNodes.has(run)) addedNodes.set(run, []);
    const copy = originals.get(run);
    const have = +run.dataset.fxCopies || 1;
    const w0 = run.getBoundingClientRect().width / have || 1;

    const track = run.parentElement?.getBoundingClientRect().width || innerWidth;
    const need = Math.max(2, Math.min(6, Math.ceil(track / w0) + 1));
    for (let i = have; i < need; i++) for (const n of copy){ const clone = n.cloneNode(true); run.appendChild(clone); addedNodes.get(run).push(clone); }
    run.dataset.fxCopies = Math.max(have, need);
  }
  function measure(){
    for (const b of bands){

      const copies = +b.run.dataset.fxCopies || 1;
      const kids = b.run.children;
      const per = kids.length / copies;
      if (copies > 1 && per >= 1 && kids[per]){
        b.loop = kids[per].getBoundingClientRect().left - kids[0].getBoundingClientRect().left;
      } else {
        b.loop = b.run.getBoundingClientRect().width / copies;
      }
      if (!(b.loop > 1)) b.loop = b.run.getBoundingClientRect().width / copies;
    }
  }
  function bindBand(){
    const runs = [...root.querySelectorAll('.band__run, .fband__run')].filter(r => r.getBoundingClientRect().width > 0);
    if (runs.length === bands.length && runs.every((r, i) => bands[i].run === r)) return;
    bands = runs.map((run, i) => {
      touchedRuns.add(run);
      if (!origAnimation.has(run)) origAnimation.set(run, run.style.animation);
      run.style.animation = 'none'; fill(run);

      const wide = run.getBoundingClientRect().width * (window.devicePixelRatio || 1) > 8192;
      run.style.willChange = wide ? 'auto' : 'transform';

      const tilted = run.classList.contains('fband__run');
      const speed = tilted ? Math.sign(SPEEDS[i % SPEEDS.length]) * 148
                           : SPEEDS[i % SPEEDS.length];
      return { run, speed, loop: 0, x: 0 };
    });
    measure();
  }
  bindBand();

  let rsz = 0;
  const onBandResize = () => { clearTimeout(rsz); rsz = setTimeout(() => { for (const b of bands) fill(b.run); measure(); }, 200); };
  addEventListener('resize', onBandResize, { passive:true });
  const NUDGE = 9;
  let lastT = 0;
  onFrame(t => {
    if (disposed) return;
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    const nudge = state.velocity * NUDGE;
    for (const b of bands){
      if (!b.loop) continue;
      b.x = (b.x - (b.speed + Math.sign(b.speed) * nudge) * dt) % b.loop;
      const x = b.x > 0 ? b.x - b.loop : b.x;
      b.run.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    }
  });

  function bindCoin(){
    const wrap = root.querySelector('[data-shine="coin"]');
    const coin = (wrap || root).querySelector('img[data-drift="coin"], img[data-drift="coin-m"], img.signal__coin, img.sg__coin-m') || root.querySelector('#signal [data-drift="coin"]');
    if (!coin) return;
    const host = wrap || coin.parentElement;
    return;
    if (host.querySelector(':scope > .fx-coin')) return;
    if (!CSS.supports('mask-image', 'url(x.png)') && !CSS.supports('-webkit-mask-image', 'url(x.png)')) return;
    const mount = () => {
      if (!coin.naturalWidth) return;
      const i = document.createElement('i');
      i.className = 'fx-coin'; i.setAttribute('aria-hidden', 'true');
      if (wrap) i.style.cssText = 'inset:0';
      else { const cs = getComputedStyle(coin); i.style.cssText = `left:${cs.left};top:${cs.top};width:${cs.width};height:${cs.height}`; }
      const url = `url("${coin.currentSrc || coin.src}")`;
      i.style.maskImage = url; i.style.webkitMaskImage = url;
      if (coin.dataset.drift) i.setAttribute('data-drift-mirror', coin.dataset.drift);
      host.appendChild(i);
    };
    coin.complete ? mount() : coin.addEventListener('load', mount, { once:true });
  }
  bindCoin();

  let intel = null;
  const seenIntel = new Set();
  const intelIO = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting){ const sec = e.target.closest('#intel'); if (sec){ sec.classList.add('is-seen'); seenIntel.add(sec); } intelIO.unobserve(e.target); }
  }, { threshold: 0.4 });
  function bindIntel(){
    const doc = root.querySelector('#intel .it__doc');
    if (!doc || doc === intel) return;
    intel = doc; intelIO.observe(doc);
  }
  bindIntel();

  function bindLogo(){
    const img = root.querySelector('#bunnyhop .bhx__logo img');
    if (!img || img.parentElement.querySelector(':scope > .fx-sweep')) return;
    const mount = () => {
      const i = document.createElement('i');
      i.className = 'fx-sweep'; i.setAttribute('aria-hidden', 'true');
      const url = `url("${img.currentSrc || img.src}")`;
      i.style.maskImage = url; i.style.webkitMaskImage = url;
      img.parentElement.appendChild(i);
    };
    img.complete ? mount() : img.addEventListener('load', mount, { once:true });
  }
  bindLogo();

  let seen = null;
  const seenBoards = new Set();
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting){ e.target.classList.add('is-seen'); seenBoards.add(e.target); io.unobserve(e.target); }
  }, { threshold: 0.35 });
  function bindBoard(){
    const b = root.querySelector('[data-flap="board"]') || root.querySelector('.board');
    if (!b || b === seen) return;
    seen = b;

    root.querySelectorAll('[data-flap="tile"]').forEach((t, i) => t.style.setProperty('--fi', i));
    io.observe(b);
  }
  bindBoard();

  const ui = root.getElementById('ui');
  let pending = 0;
  const uiMo = ui ? new MutationObserver(() => {
    if (pending) return;
    pending = setTimeout(() => { pending = 0; bindBand(); bindBoard(); bindIntel(); bindLogo(); bindCoin(); watchHeadings(); }, 120);
  }) : null;
  uiMo?.observe(ui, { childList: true, subtree: true });

  function dispose(){
    if (disposed) return;
    disposed = true;
    headIO?.disconnect();
    intelIO.disconnect();
    io.disconnect();
    uiMo?.disconnect();
    clearTimeout(pending); pending = 0;
    clearTimeout(rsz); rsz = 0;
    removeEventListener('resize', watchHeadings, { passive:true });
    removeEventListener('resize', onBandResize, { passive:true });
    if (nav) nav.classList.remove('nav--away');
    for (const run of touchedRuns){
      run.style.transform = '';
      run.style.willChange = '';
      run.style.animation = origAnimation.get(run) || '';
      for (const n of addedNodes.get(run) || []) n.remove();
      addedNodes.set(run, []);
      delete run.dataset.fxCopies;
    }
    bands = [];
    for (const el of root.querySelectorAll('.fx-sweep')) el.remove();
    for (const t of root.querySelectorAll('[data-flap="tile"]')) t.style.removeProperty('--fi');
    for (const sec of seenIntel) sec.classList.remove('is-seen');
    for (const b of seenBoards) b.classList.remove('is-seen');
    seenIntel.clear(); seenBoards.clear();
    intel = null; seen = null;
  }

  return { isAway: () => away, bands: () => bands, dispose };
}
