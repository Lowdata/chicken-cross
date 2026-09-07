const AHEAD = '150% 0px';

export function warmImages(root){
  const ui = root || document.getElementById('ui');
  if (!ui) return () => {};

  const done = new WeakSet();

  const warm = (img) => {
    if (done.has(img)) return;
    done.add(img);

    if (img.loading === 'lazy') img.loading = 'eager';
    const run = () => img.decode?.().catch(() => {});
    if (img.complete) run(); else img.addEventListener('load', run, { once: true });
  };

  const io = new IntersectionObserver(entries => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      if (e.target.tagName === 'IMG') warm(e.target);
      else for (const img of e.target.querySelectorAll('img')) warm(img);
    }
  }, { rootMargin: AHEAD });

  const watched = [...ui.querySelectorAll('section, footer'), ...ui.querySelectorAll('img')];
  for (const el of watched) io.observe(el);

  return () => io.disconnect();
}
