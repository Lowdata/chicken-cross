const listeners = new Set();
let frozen = false;

export const isFrozen = () => frozen;

export const onFreezeChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const setFrozen = (next) => {
  if (next === frozen) return;
  frozen = next;
  document.documentElement.classList.toggle('pp-frozen', frozen);
  listeners.forEach((fn) => fn(frozen));
};
