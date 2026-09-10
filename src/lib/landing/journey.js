const ease = x => x * x * (3 - 2 * x);
const span = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));

export function journey(p, beats){
  const bunny = beats.find(b => b.id === 'bunnyhop');
  const depth = bunny ? ease(span(p, bunny.at, bunny.at + 0.6 * (bunny.through - bunny.at))) : 1;
  return { depth };
}
