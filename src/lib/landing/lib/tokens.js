const css = getComputedStyle(document.documentElement);

export const token = name => css.getPropertyValue(name).trim();

export function rgb(name){
  const v = token(name);
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (m){
    const n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  const p = v.match(/[\d.]+/g);
  return p ? [p[0] / 255, p[1] / 255, p[2] / 255] : [0, 0, 0];
}
