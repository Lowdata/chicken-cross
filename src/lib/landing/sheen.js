export function mountSheen(root){
  const ui = root || document.getElementById('ui');
  if (!ui) return () => {};

  if (typeof matchMedia === 'function' && !matchMedia('(hover: none)').matches) return () => {};

  const added = [];

  function fit(box, line){
    const b = getComputedStyle(line, '::before');
    box.style.left = b.left;
    box.style.top = b.top;
    box.style.width = b.width;
    box.style.height = b.height;
    box.style.borderRadius = b.borderRadius;
  }

  const pairs = [];
  ui.querySelectorAll('.fh__plate').forEach((line, i) => {
    if (line.querySelector(':scope > .fh__sheen')) return;
    const box = document.createElement('i');
    box.className = 'fh__sheen';
    box.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('i');
    box.appendChild(bar);

    bar.style.animationDelay = `${-1.9 * i}s`;
    line.appendChild(box);
    fit(box, line);
    added.push(box);
    pairs.push([box, line]);
  });

  const refit = () => { for (const [box, line] of pairs) fit(box, line); };
  let t = 0;
  const onResize = () => { clearTimeout(t); t = window.setTimeout(refit, 160); };
  document.fonts?.ready.then(refit);
  addEventListener('resize', onResize, { passive: true });
  const settle = setTimeout(refit, 500);

  return () => {
    clearTimeout(t); clearTimeout(settle);
    removeEventListener('resize', onResize);
    for (const el of added) el.remove();
  };
}
