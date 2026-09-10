const SKIP = '.fh, .band, .fband, .nav, .lab, [data-flap], .foot__legal, button, a, .flip,' +

             ' .wr__strip, .ph__strip, .wr__cards, .ph__cards';
const CANDIDATES = '#ui p, #ui h2, #ui h3, #ui h4, #ui li, #ui span, #ui em, #ui b, #ui strong';

export function mountReveal(root){
  const ui = root || document.getElementById('ui');
  if (!ui) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const isBlock = (el) => {
    const d = getComputedStyle(el).display;
    return d !== 'inline' && d !== 'inline-block' && d !== 'contents';
  };
  const targets = [...ui.querySelectorAll(CANDIDATES)].filter(el => {
    if (el.closest(SKIP)) return false;
    if ((el.textContent || '').trim().length < 8) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 8) return false;
    for (const c of el.querySelectorAll(CANDIDATES)){
      if ((c.textContent || '').trim().length >= 8 && isBlock(c)) return false;
    }
    return true;
  });
  if (!targets.length) return () => {};

  const seen = new Map();
  for (const el of targets){
    const i = (seen.get(el.parentElement) ?? -1) + 1;
    seen.set(el.parentElement, i);
    el.style.setProperty('--reveal-i', String(Math.min(i, 6)));
    el.classList.add('will-reveal');
  }

  const show = (el) => { el.classList.add('is-revealed'); io.unobserve(el); };

  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) show(e.target);
  }, { threshold: 0 });

  let frame = requestAnimationFrame(() => {
    for (const el of targets) io.observe(el);
  });

  const sweep = () => {
    for (const el of targets){
      if (el.classList.contains('is-revealed')) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) show(el);
    }
  };
  let idle = 0;
  const onScroll = () => { clearTimeout(idle); idle = window.setTimeout(sweep, 200); };
  addEventListener('scroll', onScroll, { passive: true });
  const settle = setTimeout(sweep, 1200);

  return () => {
    cancelAnimationFrame(frame);
    io.disconnect();
    for (const el of targets){
      el.classList.remove('will-reveal', 'is-revealed');
      el.style.removeProperty('--reveal-i');
    }
  };
}
