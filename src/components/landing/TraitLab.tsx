'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type TraitItem = { name: string; url: string; thumb?: string };
type Manifest = Record<string, TraitItem[]>;

const LAYERS = [
  'Backgrounds', 'Aura - Power Effect', 'Origin Region', 'Breed - Kind', 'Evolution Stage',
  'Fur - Body', 'Skin - Material', 'Bottoms', 'Footwear', 'Clothing', 'Body Accessories',
  'Ears', 'Eyes', 'Mouths', 'Facial Hair', 'Face Accessories', 'Eyewear', 'Headwears',
  'Held Items', 'Companion - Pet', 'Specialty', '1-1 Special',
] as const;

const GLYPH: Record<string, string> = {
  'Backgrounds': '▢', 'Aura - Power Effect': '✷', 'Origin Region': '◈', 'Breed - Kind': '❥',
  'Evolution Stage': '⇡', 'Fur - Body': '❋', 'Skin - Material': '◐', 'Bottoms': '▽',
  'Footwear': '△', 'Clothing': '✚', 'Body Accessories': '✧', 'Ears': '∩', 'Eyes': '◉',
  'Mouths': '‿', 'Facial Hair': '〰', 'Face Accessories': '❂', 'Eyewear': '◎',
  'Headwears': '⌂', 'Held Items': '✱', 'Companion - Pet': '❀', 'Specialty': '★',
  '1-1 Special': '✦',
};

const HIDDEN = new Set(['Aura - Power Effect']);

const OPENING: Record<string, string> = {
  'Backgrounds': 'Cloud Sky Scene',
  'Breed - Kind': 'Netherland Dwarf',
  'Fur - Body': 'Blush Pink',
  'Eyes': 'Default Round',
  'Mouths': 'Cute Smile',
  'Clothing': 'Plain Tee',
  'Held Items': 'Carrot',
};

const pretty = (c: string) => c.replace(/ - /g, ' / ').toLowerCase();

const dispName = (v: string) => String(v).replace(/([A-Za-z])_([A-Za-z])/g, "$1'$2");

type Equipped = Partial<Record<string, TraitItem>>;

export default function TraitLab(){
  const [cats, setCats] = useState<Manifest>({});
  const [order, setOrder] = useState<string[]>([]);
  const [cat, setCat] = useState('');
  const [eq, setEq] = useState<Equipped>({});
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch('/pp-traits.json')
      .then(r => r.json())
      .then((data: Manifest) => {
        if (!live) return;

        const known = LAYERS.filter(c => data[c]?.length && !HIDDEN.has(c));
        const extra = Object.keys(data).filter(c => !LAYERS.includes(c as never) && data[c]?.length && !HIDDEN.has(c));
        setCats(data);
        setOrder([...known, ...extra]);
        setCat(prev => prev || known[0] || extra[0] || '');
        setEq(prev => {
          if (Object.keys(prev).length) return prev;
          const start: Equipped = {};
          for (const [c, name] of Object.entries(OPENING)){
            const pool = data[c];
            if (!pool?.length) continue;
            start[c] = pool.find(i => i.name === name) || pool[0];
          }
          return start;
        });
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const cover = useCallback((c: string) => {
    const a = cats[c];
    if (!a?.length) return null;
    const mid = a[Math.floor(a.length / 2)];
    return mid?.thumb || mid?.url || a.find(i => i.thumb || i.url)?.thumb || null;
  }, [cats]);

  const stack = useMemo(
    () => order.filter(c => eq[c]).sort((a, b) => LAYERS.indexOf(a as never) - LAYERS.indexOf(b as never))
      .map(c => ({ cat: c, item: eq[c]! })),
    [order, eq]
  );

  const kind = eq['Breed - Kind']?.name;
  const skin = eq['Skin - Material']?.name || eq['Fur - Body']?.name;
  const buildName = dispName(kind && skin ? `${skin} ${kind}` : kind || skin || 'empty build').toLowerCase();

  const tone = dispName(eq['Skin - Material']?.name || eq['Fur - Body']?.name || 'none').toUpperCase();
  const fit = dispName(eq['Clothing']?.name || 'none').toUpperCase();
  const held = dispName(eq['Held Items']?.name || 'none').toUpperCase();

  const items = cats[cat] || [];

  const hop = () => {
    const el = stageRef.current;
    if (!el) return;
    el.classList.remove('is-bounce');
    void el.offsetWidth;
    el.classList.add('is-bounce');
  };

  const ROLL = ['Backgrounds', 'Breed - Kind', 'Eyes', 'Mouths', 'Clothing', 'Held Items', 'Headwears'];
  const randomise = () => {
    setEq(prev => {
      const next = { ...prev };
      for (const c of ROLL){
        const a = cats[c];
        if (a?.length) next[c] = a[Math.floor(Math.random() * a.length)];
      }
      return next;
    });
    requestAnimationFrame(hop);
  };

  return (
    <div className="lab">
      <div className="panel panel--pick glass-card">
        <div className="pick__head">
          <span className="pick__label">1 · choose a slot</span>
          <button className="pick__clear" type="button" onClick={() => setEq({})}>clear all</button>
        </div>

        <div className="slotlist" data-lenis-prevent>
          {order.map(c => {
            const worn = eq[c];
            const ghost = cover(c);
            return (
              <button
                key={c}
                type="button"
                className={`slotrow${cat === c ? ' is-on' : ''}${worn ? ' has' : ''}`}
                onClick={() => setCat(c)}
              >
                <span className="slotrow__thumb">
                  {worn
                    ? <img src={worn.thumb || worn.url} alt="" loading="lazy" decoding="async" />
                    : ghost
                      ? <img className="ghost" src={ghost} alt="" loading="lazy" decoding="async" />
                      : <i>{GLYPH[c] || '+'}</i>}
                </span>
                <span className="slotrow__txt">
                  <b>{pretty(c)}</b>
                  <em>{worn ? dispName(worn.name) : 'empty'}</em>
                </span>
                {worn && (
                  <span
                    className="slotrow__x"
                    aria-label={`clear ${pretty(c)}`}
                    onClick={e => { e.stopPropagation(); setEq(p => ({ ...p, [c]: undefined })); }}
                  >✕</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel panel--traits glass-card">
        <div className="pick__head">
          <span className="pick__label">2 · pick a trait · <b>{pretty(cat)}</b></span>
          <span className="pick__count">{items.length} options</span>
        </div>
        <div className="tilewrap">
          <div className="tilewrap__scroll" data-lenis-prevent>
            <div className="tiles">
              {items.map(it => (
                <button
                  key={it.url}
                  type="button"
                  className={`tile${eq[cat]?.url === it.url ? ' is-on' : ''}`}
                  onClick={() => setEq(p => ({ ...p, [cat]: p[cat]?.url === it.url ? undefined : it }))}
                >
                  <span className="tile__tick">✓</span>
                  <span className="tile__img">
                    <img src={it.thumb || it.url} alt="" decoding="async" loading="lazy" />
                  </span>
                  <span className="tile__cap">{dispName(it.name)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel--preview glass-card">
        <div className="pick__head stagebar">
          <span className="pick__label stage__id" title={buildName}>{buildName}</span>
          <span className="pick__count stage__n">{stack.length} {stack.length === 1 ? 'layer' : 'layers'}</span>
        </div>

        <div className="stage" id="labStage" ref={stageRef} onClick={hop}>
          {stack.map(({ cat: c, item }) => (
            <img
              key={c}

              className={c === 'Backgrounds' ? 'ly ly--bg' : 'ly'}
              src={item.url}
              alt=""
              decoding="async" loading="lazy" />
          ))}
        </div>

        <div className="readout">
          TONE: {tone} · FIT: {fit} · HOLDING: {held} · SLOTS: {stack.length}/{LAYERS.length}
        </div>

        <div className="labbar">
          <button className="btn --glass --primary" data-shine type="button">Save Build</button>
          <button className="btn --glass" data-shine type="button" onClick={randomise}>Randomize</button>
        </div>
      </div>
    </div>
  );
}
