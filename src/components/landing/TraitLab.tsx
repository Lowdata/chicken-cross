'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

/* ==========================================================================
   [TEMPORARY DISABLE - LAUNCH GATE] Curated Arts Presets (Only 2 available)
   ========================================================================== */
export const ART_PRESET_1: Record<string, string> = {
  'Backgrounds': 'Cloud Sky Scene',
  'Breed - Kind': 'Netherland Dwarf',
  'Fur - Body': 'Blush Pink',
  'Eyes': 'Default Round',
  'Mouths': 'Cute Smile',
  'Clothing': 'Plain Tee',
  'Held Items': 'Carrot',
};

export const ART_PRESET_2: Record<string, string> = {
  'Backgrounds': 'Galaxy Nebula',
  'Breed - Kind': 'Cyber Construct',
  'Fur - Body': '24K Gold Fur',
  'Eyes': 'Galaxy Swirl Eyes',
  'Mouths': 'Excited Open Grin',
  'Clothing': 'Astronaut Jumpsuit',
  'Headwears': 'Blocky Pixel Crown',
  'Held Items': 'Golden Carrot Scepter',
};

const ART_PRESETS = [ART_PRESET_1, ART_PRESET_2];

const OPENING = ART_PRESET_1;

const pretty = (c: string) => c.replace(/ - /g, ' / ').toLowerCase();

const dispName = (v: string) => String(v).replace(/([A-Za-z])_([A-Za-z])/g, "$1'$2");

type Equipped = Partial<Record<string, TraitItem>>;

export default function TraitLab(){
  const [cats, setCats] = useState<Manifest>({});
  const [order, setOrder] = useState<string[]>([]);
  const [cat, setCat] = useState('');
  const [eq, setEq] = useState<Equipped>({});
  const stageRef = useRef<HTMLDivElement>(null);

  /* [TEMPORARY DISABLE - LAUNCH GATE] Presets and Tooltip state */
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string } | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisabledAction = useCallback((e: React.MouseEvent | React.TouchEvent, text = 'Coming Soon') => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    const target = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = target.left + target.width / 2;
    const y = target.top - 6;

    setTooltip({ visible: true, x, y, text });
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip(null);
    }, 2200);
  }, []);

  const hideTooltip = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip(null);
    }, 150);
  }, []);

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

  /* [TEMPORARY DISABLE - LAUNCH GATE] Only 2 curated arts available on randomize */
  const randomise = () => {
    const nextIndex = (activePresetIndex + 1) % ART_PRESETS.length;
    setActivePresetIndex(nextIndex);
    const targetPreset = ART_PRESETS[nextIndex];

    setEq(() => {
      const next: Equipped = {};
      for (const [c, name] of Object.entries(targetPreset)) {
        const pool = cats[c];
        if (pool?.length) {
          next[c] = pool.find(i => i.name === name) || pool[0];
        }
      }
      return next;
    });
    requestAnimationFrame(hop);
  };

  return (
    <div className="lab">
      {/* PANEL 1: SLOT SELECTION (GATED WITH COMING SOON TOOLTIP) */}
      <div className="panel panel--pick glass-card">
        <div className="pick__head">
          <span className="pick__label">1 · choose a slot <span className="pick__badge">Coming Soon</span></span>
          <button
            className="pick__clear is-disabled"
            type="button"
            title="Coming Soon"
            aria-disabled="true"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleDisabledAction(e, 'Coming Soon');
            }}
            onMouseEnter={e => handleDisabledAction(e, 'Coming Soon')}
            onMouseLeave={hideTooltip}
          >clear all</button>
        </div>

        <div className="slotlist" data-lenis-prevent>
          {order.map(c => {
            const worn = eq[c];
            const ghost = cover(c);
            return (
              <button
                key={c}
                type="button"
                title="Coming Soon"
                className={`slotrow is-disabled${cat === c ? ' is-on' : ''}${worn ? ' has' : ''}`}
                aria-disabled="true"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDisabledAction(e, 'Coming Soon');
                }}
                onMouseEnter={e => handleDisabledAction(e, 'Coming Soon')}
                onMouseLeave={hideTooltip}
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
                    className="slotrow__x is-disabled"
                    title="Coming Soon"
                    aria-label={`clear ${pretty(c)}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleDisabledAction(e, 'Coming Soon');
                    }}
                  >✕</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL 2: TRAIT SELECTION (GATED WITH COMING SOON TOOLTIP) */}
      <div className="panel panel--traits glass-card">
        <div className="pick__head">
          <span className="pick__label">2 · pick a trait · <b>{pretty(cat)}</b> <span className="pick__badge">Coming Soon</span></span>
          <span className="pick__count">{items.length} options</span>
        </div>
        <div className="tilewrap">
          <div className="tilewrap__scroll" data-lenis-prevent>
            <div className="tiles">
              {items.map(it => (
                <button
                  key={it.url}
                  type="button"
                  title="Coming Soon"
                  className={`tile is-disabled${eq[cat]?.url === it.url ? ' is-on' : ''}`}
                  aria-disabled="true"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDisabledAction(e, 'Coming Soon');
                  }}
                  onMouseEnter={e => handleDisabledAction(e, 'Coming Soon')}
                  onMouseLeave={hideTooltip}
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

      {/* PANEL 3: PREVIEW STAGE */}
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
          <button
            className="btn --glass --primary"
            data-shine
            type="button"
            onClick={e => handleDisabledAction(e, 'Coming Soon')}
          >Save Build</button>
          <button className="btn --glass" data-shine type="button" onClick={randomise}>Randomize</button>
        </div>
      </div>

      {/* [TEMPORARY DISABLE - LAUNCH GATE] Floating Portal Tooltip */}
      {mounted && tooltip && tooltip.visible && createPortal(
        <div
          className="lab-tooltip-portal"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="lab-tooltip-box">
            <i>🔒</i>
            <span>{tooltip.text}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
