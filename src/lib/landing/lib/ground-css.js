const num = s => parseFloat(s);
const rgb = s => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(num);
  return [p[0] / 255, p[1] / 255, p[2] / 255];
};

function splitTop(s){
  const out = []; let depth = 0, cur = '';
  for (const ch of s){
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0){ out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function readGroundCSS(el){
  const cs = getComputedStyle(el);
  const layers = splitTop(cs.backgroundImage);
  const base = rgb(cs.backgroundColor);
  if (!base) return null;

  const radials = [], linear = { stops: [] };
  for (const layer of layers){
    if (layer === 'none') continue;
    const inner = layer.slice(layer.indexOf('(') + 1, layer.lastIndexOf(')'));
    const parts = splitTop(inner);
    if (layer.startsWith('radial-gradient')){
      const m = parts[0].match(/([\d.]+)%\s+([\d.]+)%\s+at\s+(-?[\d.]+)%\s+(-?[\d.]+)%/);
      const c = rgb(parts[1]);
      const s = parts[2]?.match(/([\d.]+)%\s*$/);
      if (!m || !c || !s) return null;
      radials.push({ rx: num(m[1]) / 100, ry: num(m[2]) / 100, cx: num(m[3]) / 100, cy: num(m[4]) / 100, color: c, stop: num(s[1]) / 100 });
    } else if (layer.startsWith('linear-gradient')){
      for (const p of parts){
        if (/^\d+deg$/.test(p)){ if (p !== '180deg') return null; continue; }
        const c = rgb(p), pos = p.match(/([\d.]+)%\s*$/);
        if (!c || !pos) return null;
        linear.stops.push({ color: c, at: num(pos[1]) / 100 });
      }
    } else return null;
  }
  if (radials.length !== 3 || linear.stops.length !== 4) return null;
  return { base, radials, linear: linear.stops };
}
