const FRAME = 440;
const PAD_X = 14;

export function fitToFrame(ui){
  if (!ui) return () => {};

  const plates = () => ui.querySelectorAll('.fh__plate');

  function scale(){
    const m = innerWidth >= 1100 ? 1 : Math.min(1, innerWidth / FRAME);
    ui.style.setProperty('--m', m.toFixed(5));
    return m;
  }

  function alone(ln, box){
    for (const other of ln.parentElement.querySelectorAll('.fh__ln')){
      if (other === ln) continue;
      const r = other.getBoundingClientRect();
      if (r.height < 6) continue;
      const overlap = Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top);
      if (overlap > Math.min(box.height, r.height) * 0.5) return false;
    }
    return true;
  }

  function plate(m){
    for (const ln of plates()){
      if (innerWidth >= 1100){
        ln.style.removeProperty('--plw');
        ln.style.marginLeft = '';
        continue;
      }
      const t = ln.querySelector('.fh__t');
      if (!t || !ln.getClientRects().length) continue;

      if (ln.style.marginLeft) ln.style.marginLeft = '';
      const box = ln.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(t);
      const ink = range.getBoundingClientRect();
      if (!ink.width) continue;

      ln.style.setProperty('--plw', (ink.width / m + PAD_X * 2).toFixed(1) + 'px');

      if (getComputedStyle(ln).textAlign === 'center' && alone(ln, box)){
        const off = innerWidth / 2 - (ink.left + ink.width / 2);
        ln.style.marginLeft = Math.abs(off) > 1 ? (off / m).toFixed(1) + 'px' : '';
      }
    }
  }

  const fit = () => plate(scale());

  let idle = 0, pending = 0;
  const onScroll = () => { clearTimeout(idle); idle = window.setTimeout(fit, 260); };
  const onResize = () => { clearTimeout(pending); pending = window.setTimeout(fit, 120); };

  fit();
  document.fonts?.ready.then(fit);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize, { passive: true });

  return () => {
    clearTimeout(idle);
    clearTimeout(pending);
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onResize);
    ui.style.removeProperty('--m');
    for (const ln of plates()){
      ln.style.removeProperty('--plw');
      ln.style.marginLeft = '';
    }
  };
}
