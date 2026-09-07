const HEADS = [
  { sel: '#warren h2', stagger: 0.14, lead: 0.92, span: 0.42 },
  { sel: '#signal h2', stagger: 0.22, lead: 0.90, span: 0.50 }
];

const c1 = 1.35, c3 = c1 + 1;
const outBack = k => 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);

export function mountType({ onFrame, state, root = document }){
  let heads = [];
  let vh = innerHeight;
  let disposed = false;

  function measure(){
    if (disposed) return;
    vh = innerHeight;
    const y0 = scrollY;
    for (const h of heads){
      let i = 0;
      for (const l of h.lines){
        l.on = getComputedStyle(l.el).display !== 'none';
        if (!l.on){ l.el.style.transform = ''; l.el.style.opacity = ''; continue; }
        l.i = i++;
        l.top = l.el.getBoundingClientRect().top + y0;
      }
    }
  }

  function resolve(){
    const next = [];
    for (const spec of HEADS){
      const el = root.querySelector(spec.sel);
      if (!el) continue;
      const nodes = el.querySelectorAll('.d2__ln').length ? el.querySelectorAll('.d2__ln') : el.querySelectorAll('img');
      const lines = [...nodes].map(el => ({ el, i: 0, top: 0, last: -1, on: true }));
      if (lines.length) next.push({ ...spec, el, lines });
    }
    heads = next;
    measure();
  }
  resolve();

  const ui = root.getElementById('ui');
  let pending = 0;
  const uiMo = ui ? new MutationObserver(() => {
    if (pending) return;
    pending = setTimeout(() => { pending = 0; resolve(); }, 120);
  }) : null;
  uiMo?.observe(ui, { childList: true, subtree: true });
  addEventListener('resize', measure, { passive:true });
  document.fonts?.ready.then(measure);
  addEventListener('load', measure, { once:true });

  onFrame(() => {
    if (disposed) return;
    const s = state.scroll;
    for (const h of heads){
      for (const l of h.lines){
        if (!l.on) continue;

        let k = (s + vh * h.lead - l.top) / (vh * h.span) - l.i * h.stagger;
        k = Math.min(1, Math.max(0, k));

        if (vh > 1600 || l.last >= 1) k = 1;
        const q = Math.round(k * 400) / 400;
        if (q === l.last) continue;
        l.last = q;
        if (q >= 1){ l.el.style.transform = ''; l.el.style.opacity = ''; continue; }
        const e = outBack(q);
        const y = 64 * (1 - e);
        const sy = 0.88 + 0.12 * e;
        l.el.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scaleY(${sy.toFixed(3)})`;
        l.el.style.opacity = Math.min(1, q * 3).toFixed(3);
      }
    }
  });

  function dispose(){
    if (disposed) return;
    disposed = true;
    uiMo?.disconnect();
    clearTimeout(pending); pending = 0;
    removeEventListener('resize', measure, { passive:true });
    removeEventListener('load', measure, { once:true });
    for (const h of heads) for (const l of h.lines){ l.el.style.transform = ''; l.el.style.opacity = ''; }
    heads = [];
  }

  return { heads: () => heads, dispose };
}
