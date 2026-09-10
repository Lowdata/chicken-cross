const BUTTONS = '.btn, .bhx__play, .bhx__how, [data-shine]';
const CARDS   = '#physical .pg, #warren .wc, [data-hover="card"]';

const HOLO    = '.fh__ln';

export function mountTouch({ root = document } = {}){

  if (typeof matchMedia === 'function' && matchMedia('(hover: none)').matches){
    return { dispose(){} };
  }

  let disposed = false;
  const rects = new WeakMap();
  const addedShines = new Set();
  const dressedFx = new Set();
  const dressedFxh = new Set();
  const oxOyTwins = new Set();
  const twinOf = el => {
    const m = /\bwc--(\d)\b/.exec(el.className);
    return m ? root.querySelector(`#warren .wc__well--${m[1]}`) : null;
  };

  function dress(){

    for (const el of root.querySelectorAll(BUTTONS)){ el.setAttribute('data-fx', 'button'); dressedFx.add(el); }
    for (const el of root.querySelectorAll(HOLO)){ el.setAttribute('data-fxh', 'holo'); dressedFxh.add(el); }
    for (const el of root.querySelectorAll(CARDS)){
      el.setAttribute('data-fx', 'card'); dressedFx.add(el);
      if (el.querySelector(':scope > .fx-shine')) continue;
      const i = document.createElement('i');
      i.className = 'fx-shine'; i.setAttribute('aria-hidden', 'true');
      el.appendChild(i);
      addedShines.add(i);
    }
  }
  dress();

  const ui = root.getElementById('ui');
  let pending = 0;
  const uiMo = ui ? new MutationObserver(() => {
    if (pending) return;
    pending = setTimeout(() => { pending = 0; dress(); }, 120);
  }) : null;
  uiMo?.observe(ui, { childList: true, subtree: true });

  const onPointerEnter = e => {
    const el = e.target.closest?.('[data-fx],[data-fxh]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    rects.set(el, r);

    const twin = twinOf(el);
    if (twin){
      const t = twin.getBoundingClientRect();
      twin.style.setProperty('--ox', (r.left + r.width / 2 - t.left).toFixed(1) + 'px');
      twin.style.setProperty('--oy', (r.top + r.height / 2 - t.top).toFixed(1) + 'px');
      oxOyTwins.add(twin);
    }
  };
  root.addEventListener('pointerenter', onPointerEnter, true);

  const onPointerMove = e => {
    const el = e.target.closest?.('[data-fx],[data-fxh]');
    if (!el) return;
    const r = rects.get(el) || (rects.set(el, el.getBoundingClientRect()), rects.get(el));
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const st = el.style;
    st.setProperty('--mx', (px * 100).toFixed(1) + '%');
    st.setProperty('--my', (py * 100).toFixed(1) + '%');

    const twin = twinOf(el);
    if (el.dataset.fx === 'card' && twin) twin.setAttribute('data-fx-twin', 'on');
  };
  root.addEventListener('pointermove', onPointerMove, { passive: true });

  const onPointerLeave = e => {
    const el = e.target.closest?.('[data-fx],[data-fxh]');
    if (!el) return;
    const twin = twinOf(el);
    if (twin) twin.removeAttribute('data-fx-twin');
    rects.delete(el);
  };
  root.addEventListener('pointerleave', onPointerLeave, true);

  function dispose(){
    if (disposed) return;
    disposed = true;
    uiMo?.disconnect();
    clearTimeout(pending); pending = 0;
    root.removeEventListener('pointerenter', onPointerEnter, true);
    root.removeEventListener('pointermove', onPointerMove, { passive: true });
    root.removeEventListener('pointerleave', onPointerLeave, true);
    for (const i of addedShines) i.remove();
    addedShines.clear();
    for (const el of dressedFx){ el.removeAttribute('data-fx'); el.style.removeProperty('--mx'); el.style.removeProperty('--my'); }
    for (const el of dressedFxh){ el.removeAttribute('data-fxh'); el.style.removeProperty('--mx'); el.style.removeProperty('--my'); }
    dressedFx.clear(); dressedFxh.clear();
    for (const el of root.querySelectorAll('[data-fx-twin]')) el.removeAttribute('data-fx-twin');
    for (const el of oxOyTwins){ el.style.removeProperty('--ox'); el.style.removeProperty('--oy'); }
    oxOyTwins.clear();
  }

  return { dispose };
}
