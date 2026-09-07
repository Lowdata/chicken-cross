export function mountFps(){
  if (typeof location === 'undefined') return () => {};
  if (!/[?&]fps\b/.test(location.search)) return () => {};

  const wrap = document.createElement('div');
  wrap.id = 'pp-fps';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = [
    'position:fixed', 'z-index:2147483647', 'left:8px', 'bottom:8px',
    'padding:7px 9px', 'border-radius:7px',
    'background:rgba(12,6,32,.86)', 'color:#9ef7c9',
    'font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace',
    'letter-spacing:.02em', '-webkit-backdrop-filter:blur(4px)', 'backdrop-filter:blur(4px)',
    'pointer-events:none',
  ].join(';');

  const line = document.createElement('div');
  line.style.whiteSpace = 'pre';
  wrap.appendChild(line);

  document.body.appendChild(wrap);

  const recent = [];
  let last = performance.now();
  let worst = 0;
  let painted = last;
  let raf = requestAnimationFrame(function tick(t){
    const dt = t - last;
    last = t;
    recent.push(dt);
    if (recent.length > 100) recent.shift();
    if (dt > worst) worst = dt;

    if (t - painted > 250 && recent.length){
      painted = t;
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const long = recent.filter(v => v > 20).length;
      const section = [...document.querySelectorAll('#ui section, #ui .hero')]
        .find(s => { const r = s.getBoundingClientRect(); return r.top < innerHeight / 2 && r.bottom > innerHeight / 2; });
      line.textContent =
        `${(1000 / avg).toFixed(0)} fps   worst ${worst.toFixed(0)}ms   long ${long}/100\n` +
        `${section?.id || section?.className?.split(' ')[0] || '—'}`;
      worst = 0;
    }
    raf = requestAnimationFrame(tick);
  });

  return () => {
    cancelAnimationFrame(raf);
    wrap.remove();
  };
}
