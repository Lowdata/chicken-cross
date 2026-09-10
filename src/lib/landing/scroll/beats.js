export const BEATS = ['top','bunnyhop','warren','physical','lab','signal','intel','drop','footer'];

function find(id){
  return document.getElementById(id)
      || (id === 'footer' ? document.querySelector('footer') : null);
}

export function readBeats(){
  const doc  = document.documentElement;
  const span = Math.max(1, doc.scrollHeight - innerHeight);
  const y0   = scrollY;
  return BEATS.map(id => {
    const el = find(id);
    if (!el) return null;
    const r   = el.getBoundingClientRect();
    const top = r.top + y0;
    return { id, top, height: r.height,
             at: Math.min(1, top / span), through: Math.min(1, (top + r.height) / span) };
  }).filter(Boolean);
}

export function beatAt(beats, p){
  for (let i = beats.length - 1; i >= 0; i--){
    if (p >= beats[i].at){
      const b = beats[i], span = Math.max(1e-4, b.through - b.at);
      return { index:i, id:b.id, local: Math.min(1, (p - b.at) / span) };
    }
  }
  return { index:0, id:beats[0]?.id ?? 'top', local:0 };
}

export function watchBeats(onChange){
  let beats = readBeats();
  onChange(beats);
  const refresh = () => { beats = readBeats(); onChange(beats); };
  const ui = document.getElementById('ui');
  if (ui && 'ResizeObserver' in window) new ResizeObserver(refresh).observe(ui);
  addEventListener('resize', refresh, { passive:true });
  document.fonts?.ready.then(refresh);
  addEventListener('load', refresh, { once:true });
  return () => beats;
}
